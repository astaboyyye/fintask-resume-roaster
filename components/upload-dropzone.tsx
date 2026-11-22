'use client';

import { useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { PdfValidationError, validatePdfMetadata } from '@/lib/pdf-validation';

type ApiError = { error?: { code?: string; message?: string } };
type ApiSuccess = { id?: string };

export function UploadDropzone() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function chooseFile(candidate: File | null) {
    setError('');
    if (!candidate) { setFile(null); return; }
    try {
      validatePdfMetadata(candidate);
      setFile(candidate);
    } catch (cause) {
      setFile(null);
      setError(cause instanceof PdfValidationError ? cause.message : 'Please choose a valid PDF.');
    }
  }

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    chooseFile(event.target.files?.[0] ?? null);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    chooseFile(event.dataTransfer.files?.[0] ?? null);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || loading) return;
    setLoading(true);
    setError('');
    try {
      const form = new FormData();
      form.set('file', file);
      const response = await fetch('/api/roast', { method: 'POST', body: form });
      const data: ApiError & ApiSuccess = await response.json();
      if (!response.ok || !data.id) {
        setError(data.error?.message ?? 'We could not roast this resume. Please try again.');
        return;
      }
      router.push(`/roast/${encodeURIComponent(data.id)}`);
      router.refresh();
    } catch {
      setError('We could not reach the server. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none sm:p-9">
      <div
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`rounded-2xl border-2 border-dashed px-6 py-14 text-center transition ${dragging ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/40' : 'border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-950'}`}
      >
        <div aria-hidden="true" className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-3xl dark:bg-violet-900/40">📄</div>
        <label htmlFor="resume-file" className="block text-xl font-bold">Drop your resume here</label>
        <p className="mt-2 text-slate-600 dark:text-slate-300">or choose a PDF from your device</p>
        <input ref={inputRef} id="resume-file" name="resume-file" type="file" accept="application/pdf,.pdf" onChange={onChange} disabled={loading} className="sr-only" aria-describedby="file-help" />
        <button type="button" disabled={loading} onClick={() => inputRef.current?.click()} className="mt-6 rounded-xl border border-violet-500 px-5 py-2.5 font-semibold text-violet-700 transition hover:bg-violet-50 disabled:opacity-50 dark:text-violet-300 dark:hover:bg-violet-950/40">Choose PDF</button>
        <p id="file-help" className="mt-4 text-sm text-slate-500 dark:text-slate-400">PDF only · Up to 5 MB · Text-based PDFs work best</p>
      </div>
      {file && <p className="mt-5 break-all text-sm font-medium" aria-live="polite">Selected: {file.name}</p>}
      <div aria-live="assertive" className="mt-4 min-h-6 text-sm font-semibold text-rose-600 dark:text-rose-400">{error}</div>
      <button type="submit" disabled={!file || loading} className="mt-3 w-full rounded-xl bg-violet-600 px-6 py-3.5 font-bold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50">
        {loading ? 'Roasting your resume…' : 'Roast my resume'}
      </button>
      <p aria-live="polite" className="mt-3 text-center text-sm text-slate-500 dark:text-slate-400">{loading ? 'This usually takes a few moments. Please keep this page open.' : 'Your feedback will appear as soon as it is ready.'}</p>
    </form>
  );
}
