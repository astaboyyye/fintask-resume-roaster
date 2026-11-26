'use client';

import Link from 'next/link';
import { useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from 'react';
import { RoastResultView } from '@/components/roast-result';
import { PdfValidationError, validatePdfMetadata } from '@/lib/pdf-validation';
import type { RoastResult } from '@/lib/roast-schema';

type ApiResponse = {
  result?: RoastResult;
  mode?: 'ai' | 'local';
  id?: string | null;
  saved?: boolean;
  error?: { code?: string; message?: string };
};

type Outcome = { result: RoastResult; mode: 'ai' | 'local'; id: string | null; saved: boolean };

export function UploadDropzone({ savingEnabled }: { savingEnabled: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  function chooseFile(candidate: File | null) {
    setError('');
    setNeedsSignIn(false);
    setOutcome(null);
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
    event.target.value = '';
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (!loading) chooseFile(event.dataTransfer.files?.[0] ?? null);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || loading) return;
    setLoading(true);
    setError('');
    setNeedsSignIn(false);
    setOutcome(null);
    try {
      const form = new FormData();
      form.set('file', file);
      const response = await fetch('/api/roast', { method: 'POST', body: form });
      const data = (await response.json().catch(() => ({}))) as ApiResponse;
      if (response.status === 401) {
        setNeedsSignIn(true);
        setError('Your session has ended. Please sign in again.');
        return;
      }
      if (response.status === 413 && !data.error) {
        setError('This file is too large to upload. Choose a PDF of 4 MB or less.');
        return;
      }
      if (!response.ok || !data.result) {
        setError(data.error?.message ?? 'We could not review this resume. Please try again.');
        return;
      }
      setOutcome({ result: data.result, mode: data.mode ?? 'local', id: data.id ?? null, saved: Boolean(data.saved) });
    } catch {
      setError('We could not reach the server. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={(event) => void onSubmit(event)} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900 sm:p-9">
        <div
          onDragOver={(event) => { event.preventDefault(); if (!loading) setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`rounded-2xl border-2 border-dashed px-6 py-12 text-center transition ${dragging ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/40' : 'border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-950'}`}
        >
          <div aria-hidden="true" className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-3xl dark:bg-violet-900/40">📄</div>
          <label htmlFor="resume-file" className="block text-xl font-bold">Drop your resume here</label>
          <p className="mt-2 text-slate-600 dark:text-slate-300">or choose a PDF from your device</p>
          <input ref={inputRef} id="resume-file" name="resume-file" type="file" accept="application/pdf,.pdf" onChange={onChange} disabled={loading} className="sr-only" aria-describedby="file-help" />
          <button type="button" disabled={loading} onClick={() => inputRef.current?.click()} className="mt-6 rounded-xl border border-violet-500 px-5 py-2.5 font-semibold text-violet-700 hover:bg-violet-50 disabled:opacity-50 dark:text-violet-300 dark:hover:bg-violet-950/40">Choose PDF</button>
          <p id="file-help" className="mt-4 text-sm text-slate-500 dark:text-slate-400">PDF only · Up to 4 MB · Text-based PDFs work best</p>
        </div>
        {file && <p className="mt-5 break-all text-sm font-medium" aria-live="polite">Selected: {file.name}</p>}
        <div role="alert" className="mt-4 min-h-6 text-sm font-semibold text-rose-600 dark:text-rose-400">
          {error}
          {needsSignIn && <> <Link href="/signin" className="underline">Sign in</Link></>}
        </div>
        <button type="submit" disabled={!file || loading} className="mt-3 w-full rounded-xl bg-violet-600 px-6 py-3.5 font-bold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50">{loading ? 'Claude is reading your resume…' : 'Roast my resume'}</button>
        <p aria-live="polite" className="mt-3 text-center text-sm text-slate-500 dark:text-slate-400">
          {loading ? 'This usually takes 10 to 30 seconds. Please keep this page open.' : savingEnabled ? 'Feedback appears below and is saved to your history.' : 'Feedback appears below, right on this page.'}
        </p>
      </form>

      {outcome && (
        <div className="mt-10 space-y-5" aria-live="polite">
          {outcome.id ? (
            <p className="rounded-2xl bg-emerald-50 px-5 py-3 text-sm font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
              Saved to your history. <Link href={`/roast/${outcome.id}`} className="font-bold underline">Open this roast</Link> or <Link href="/history" className="font-bold underline">see all roasts</Link>.
            </p>
          ) : savingEnabled && (
            <p className="rounded-2xl bg-amber-50 px-5 py-3 text-sm font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">Your feedback is below, but we could not save it to your history this time.</p>
          )}
          <RoastResultView result={outcome.result} mode={outcome.mode} />
        </div>
      )}
    </div>
  );
}
