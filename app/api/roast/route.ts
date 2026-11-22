import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { auth } from '@/lib/auth';
import { generateRoast, LlmError } from '@/lib/llm';
import { extractResumeText } from '@/lib/pdf';
import { PdfValidationError, validatePdfMetadata } from '@/lib/pdf-validation';
import { prisma } from '@/lib/prisma';
import { consumeRoastQuota } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const maxDuration = 60;

type ErrorCode = 'UNAUTHORIZED' | 'INVALID_FILE' | 'RATE_LIMITED' | 'AI_UNAVAILABLE' | 'SERVER_ERROR';
type ErrorResponse = { error: { code: ErrorCode; message: string } };

function errorResponse(code: ErrorCode, message: string, status: number) {
  return NextResponse.json<ErrorResponse>({ error: { code, message } }, { status });
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse('UNAUTHORIZED', 'Please sign in to roast a resume.', 401);

    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return errorResponse('INVALID_FILE', 'Send a PDF file using multipart form data.', 400);
    }

    const file = form.get('file');
    if (!(file instanceof File)) return errorResponse('INVALID_FILE', 'Choose a PDF resume to upload.', 400);

    validatePdfMetadata(file);
    const bytes = new Uint8Array(await file.arrayBuffer());
    const resumeText = await extractResumeText(bytes);

    const allowed = await consumeRoastQuota(session.user.id);
    if (!allowed) return errorResponse('RATE_LIMITED', 'You have used your five roasts for this hour. Please try again later.', 429);

    const result = await generateRoast(resumeText);
    const roast = await prisma.roast.create({
      data: {
        userId: session.user.id,
        fileName: file.name.replace(/[\\/\u0000-\u001f]/g, '_').slice(0, 255),
        resumeText,
        resultJson: result as Prisma.InputJsonValue,
        score: result.overall_score,
      },
      select: { id: true },
    });
    return NextResponse.json({ id: roast.id }, { status: 201 });
  } catch (error) {
    if (error instanceof PdfValidationError) return errorResponse('INVALID_FILE', error.message, error.status);
    if (error instanceof LlmError) return errorResponse('AI_UNAVAILABLE', error.message, 502);
    return errorResponse('SERVER_ERROR', 'Something went wrong. Please try again.', 500);
  }
}
