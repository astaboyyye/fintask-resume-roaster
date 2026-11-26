import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { DatabaseError, isDatabaseConfigured, saveRoast } from '@/lib/db';
import { generateRoast, isAiConfigured, LlmError } from '@/lib/llm';
import { generateLocalRoast } from '@/lib/local-roast';
import { extractResumeText } from '@/lib/pdf';
import { PdfValidationError, validatePdfMetadata } from '@/lib/pdf-validation';
import { claimRoast } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type RoastErrorCode = 'UNAUTHORIZED' | 'INVALID_FILE' | 'RATE_LIMITED' | 'AI_UNAVAILABLE' | 'SERVER_ERROR';

function errorResponse(code: RoastErrorCode, message: string, status: number, headers?: HeadersInit) {
  return NextResponse.json({ error: { code, message } }, { status, headers });
}

function cleanFileName(name: string): string {
  const cleaned = name.replace(/[\u0000-\u001f\u007f]/g, '').trim();
  return (cleaned || 'resume.pdf').slice(0, 200);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return errorResponse('UNAUTHORIZED', 'Please sign in to roast your resume.', 401);

  try {
    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return errorResponse('INVALID_FILE', 'Send a PDF file using multipart form data.', 400);
    }

    const file = form.get('file');
    if (!(file instanceof File)) return errorResponse('INVALID_FILE', 'Choose a PDF resume to upload.', 400);

    validatePdfMetadata(file);
    const resumeText = await extractResumeText(new Uint8Array(await file.arrayBuffer()));

    // Counted after validation so a bad file does not use up the user's quota,
    // but before the AI call so failed or slow AI attempts still count.
    const limit = await claimRoast(user.id);
    if (!limit.allowed) {
      const minutes = Math.ceil(limit.retryAfterSeconds / 60);
      return errorResponse('RATE_LIMITED', `You have reached the hourly roast limit. Try again in about ${minutes} minute${minutes === 1 ? '' : 's'}.`, 429, { 'Retry-After': String(limit.retryAfterSeconds) });
    }

    const mode = isAiConfigured() ? 'ai' : 'local';
    const result = mode === 'ai' ? await generateRoast(resumeText) : generateLocalRoast(resumeText);

    let id: string | null = null;
    if (isDatabaseConfigured()) {
      try {
        id = await saveRoast({ user, fileName: cleanFileName(file.name), resumeText, result, mode });
      } catch (error) {
        // The feedback is still useful even if saving fails, so return it with saved: false.
        if (!(error instanceof DatabaseError)) throw error;
      }
    }

    return NextResponse.json({ result, mode, id, saved: id !== null });
  } catch (error) {
    if (error instanceof PdfValidationError) return errorResponse('INVALID_FILE', error.message, error.status);
    if (error instanceof LlmError) return errorResponse('AI_UNAVAILABLE', error.message, 502);
    if (error instanceof DatabaseError) return errorResponse('SERVER_ERROR', 'We could not check your roast limit. Please try again.', 503);
    console.error('[api/roast] unexpected error:', error);
    return errorResponse('SERVER_ERROR', 'Something went wrong. Please try again.', 500);
  }
}
