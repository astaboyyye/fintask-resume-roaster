import { PDFParse } from 'pdf-parse';
import { PdfValidationError, validatePdfSignature } from '@/lib/pdf-validation';

export const MAX_RESUME_CHARS = 16_000;

export async function extractResumeText(bytes: Uint8Array): Promise<string> {
  validatePdfSignature(bytes);
  try {
    const parser = new PDFParse({ data: bytes });
    let result: Awaited<ReturnType<PDFParse['getText']>>;
    try {
      result = await parser.getText();
    } finally {
      await parser.destroy();
    }
    const text = result.text.replace(/\s+/g, ' ').trim();
    if (text.length < 40) {
      throw new PdfValidationError('We could not find enough readable text. Image-only or empty PDFs are not supported.');
    }
    return text.slice(0, MAX_RESUME_CHARS);
  } catch (error) {
    if (error instanceof PdfValidationError) throw error;
    throw new PdfValidationError('We could not read this PDF. Try exporting it as a text-based PDF.');
  }
}
