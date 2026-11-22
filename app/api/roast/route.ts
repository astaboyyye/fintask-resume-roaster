import { NextResponse } from 'next/server';
import { generateRoast, LlmError } from '@/lib/llm';
import { generateLocalRoast } from '@/lib/local-roast';
import { extractResumeText } from '@/lib/pdf';
import { PdfValidationError, validatePdfMetadata } from '@/lib/pdf-validation';

export const runtime = 'nodejs';
export const maxDuration = 60;

type ErrorCode = 'INVALID_FILE' | 'AI_UNAVAILABLE' | 'SERVER_ERROR';
type ErrorResponse = { error: { code: ErrorCode; message: string } };

function errorResponse(code: ErrorCode, message: string, status: number) {
  return NextResponse.json<ErrorResponse>({ error: { code, message } }, { status });
}

export async function POST(request: Request) {
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
    const bytes = new Uint8Array(await file.arrayBuffer());
    const resumeText = await extractResumeText(bytes);

    const aiEnabled = Boolean(process.env.GROQ_API_KEY);
    const result = aiEnabled ? await generateRoast(resumeText) : generateLocalRoast(resumeText);
    return NextResponse.json({ result, mode: aiEnabled ? 'ai' : 'local' }, { status: 200 });
  } catch (error) {
    if (error instanceof PdfValidationError) return errorResponse('INVALID_FILE', error.message, error.status);
    if (error instanceof LlmError) return errorResponse('AI_UNAVAILABLE', error.message, 502);
    return errorResponse('SERVER_ERROR', 'Something went wrong. Please try again.', 500);
  }
}
