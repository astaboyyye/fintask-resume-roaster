import { extractText, getDocumentProxy } from 'unpdf';
import { PdfValidationError, validatePdfSignature } from '@/lib/pdf-validation';

/** About five dense pages. Longer documents are rejected rather than silently cut off. */
export const MAX_RESUME_CHARS = 20_000;
export const MIN_RESUME_CHARS = 150;
export const MAX_RESUME_PAGES = 10;

export async function extractResumeText(bytes: Uint8Array): Promise<string> {
  validatePdfSignature(bytes);

  let rawText: string;
  let pageCount: number;
  try {
    // unpdf ships a serverless PDF.js build, so text extraction needs no native canvas on Vercel.
    const pdf = await getDocumentProxy(bytes);
    try {
      const extracted = await extractText(pdf, { mergePages: true });
      rawText = extracted.text;
      pageCount = extracted.totalPages;
    } finally {
      await pdf.loadingTask.destroy();
    }
  } catch {
    throw new PdfValidationError('We could not read this PDF. Try exporting it again as a text-based PDF.');
  }

  if (pageCount > MAX_RESUME_PAGES) {
    throw new PdfValidationError(`This PDF has ${pageCount} pages. Upload a resume of ${MAX_RESUME_PAGES} pages or fewer.`, 413);
  }

  const text = rawText.replace(/\s+/g, ' ').trim();
  if (text.length < MIN_RESUME_CHARS) {
    throw new PdfValidationError('We could not find enough readable text. Scanned or image-only PDFs are not supported.');
  }
  if (text.length > MAX_RESUME_CHARS) {
    throw new PdfValidationError(`This document has too much text for a resume (over ${MAX_RESUME_CHARS.toLocaleString('en-US')} characters). Upload a shorter resume.`, 413);
  }
  return text;
}
