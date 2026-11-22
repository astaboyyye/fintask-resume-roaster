export const MAX_PDF_BYTES = 5 * 1024 * 1024;

export class PdfValidationError extends Error {
  constructor(message: string, public readonly status: 413 | 415 | 422 = 422) {
    super(message);
  }
}

export function validatePdfMetadata(file: Pick<File, 'size' | 'type' | 'name'>): void {
  if (file.type !== 'application/pdf') {
    throw new PdfValidationError('Please choose a PDF file.', 415);
  }
  if (file.size === 0) {
    throw new PdfValidationError('This PDF is empty. Choose a resume with readable text.');
  }
  if (file.size > MAX_PDF_BYTES) {
    throw new PdfValidationError('Your PDF must be 5 MB or smaller.', 413);
  }
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    throw new PdfValidationError('The file name must end in .pdf.', 415);
  }
}

export function validatePdfSignature(bytes: Uint8Array): void {
  if (bytes.length < 5 || new TextDecoder().decode(bytes.subarray(0, 5)) !== '%PDF-') {
    throw new PdfValidationError('This file is not a valid PDF.');
  }
}
