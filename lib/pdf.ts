import { PDFParse } from 'pdf-parse';
import { PdfValidationError, validatePdfSignature } from '@/lib/pdf-validation';

/** About five dense pages. Longer documents are rejected rather than silently cut off. */
export const MAX_RESUME_CHARS = 20_000;
export const MIN_RESUME_CHARS = 150;

export async function extractResumeText(bytes: Uint8Array): Promise<string> {
  validatePdfSignature(bytes);

  let rawText: string;
  try {
    const parser = new PDFParse({ data: bytes });
    try {
      rawText = (await parser.getText()).text;
    } finally {
      await parser.destroy();
    }
  } catch {
    throw new PdfValidationError('We could not read this PDF. Try exporting it again as a text-based PDF.');
  }

  const text = rawText.replace(/\s+/g, ' ').trim();
  if (text.length < MIN_RESUME_CHARS) {
    throw new PdfValidationError('We could not find enough readable text. Scanned or image-only PDFs are not supported.');
  }
  if (text.length > MAX_RESUME_CHARS) {
    throw new PdfValidationError(`This document has too much text for a resume (over ${MAX_RESUME_CHARS.toLocaleString('en-US')} characters). Upload a resume of five pages or fewer.`, 413);
  }
  return text;
}
