'use client';

import { useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from 'react';
import { FeedbackCard } from '@/components/feedback-card';
import { ScoreCircle } from '@/components/score-circle';
import { PdfValidationError, validatePdfMetadata } from '@/lib/pdf-validation';
import type { RoastResult } from '@/lib/roast-schema';

type ApiResponse = { result?: RoastResult; mode?: 'ai' | 'local'; error?: { message?: string } };

export function UploadDropzone() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<RoastResult | null>(null);
  const [mode, setMode] = useState<'ai' | 'local'>('local');

  function chooseFile(candidate: File | null) {
    setError('');
    setResult(null);
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
    setResult(null);
    try {
      const form = new FormData();
      form.set('file', file);
      const response = await fetch('/api/roast', { method: 'POST', body: form });
      const data: ApiResponse = await response.json();
      if (!response.ok || !data.result) {
        setError(data.error?.message ?? 'We could not read this resume. Please try again.');
        return;
      }
      setResult(data.result);
      setMode(data.mode ?? 'local');
    } catch {
      setError('We could not reach the server. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={(event) => void onSubmit(event)} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900 sm:p-9">
        <div onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop} className={`rounded-2xl border-2 border-dashed px-6 py-12 text-center transition ${dragging ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/40' : 'border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-950'}`}>
          <div aria-hidden="true" className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-3xl dark:bg-violet-900/40">📄</div>
          <label htmlFor="resume-file" className="block text-xl font-bold">Drop your resume here</label>
          <p className="mt-2 text-slate-600 dark:text-slate-300">or choose a PDF from your device</p>
          <input ref={inputRef} id="resume-file" name="resume-file" type="file" accept="application/pdf,.pdf" onChange={onChange} disabled={loading} className="sr-only" aria-describedby="file-help" />
          <button type="button" disabled={loading} onClick={() => inputRef.current?.click()} className="mt-6 rounded-xl border border-violet-500 px-5 py-2.5 font-semibold text-violet-700 hover:bg-violet-50 disabled:opacity-50 dark:text-violet-300 dark:hover:bg-violet-950/40">Choose PDF</button>
          <p id="file-help" className="mt-4 text-sm text-slate-500 dark:text-slate-400">PDF only · Up to 5 MB · Text-based PDFs work best</p>
        </div>
        {file && <p className="mt-5 break-all text-sm font-medium" aria-live="polite">Selected: {file.name}</p>}
        <div aria-live="assertive" className="mt-4 min-h-6 text-sm font-semibold text-rose-600 dark:text-rose-400">{error}</div>
        <button type="submit" disabled={!file || loading} className="mt-3 w-full rounded-xl bg-violet-600 px-6 py-3.5 font-bold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50">{loading ? 'Reviewing your resume…' : 'Roast my resume'}</button>
        <p aria-live="polite" className="mt-3 text-center text-sm text-slate-500 dark:text-slate-400">{loading ? 'This can take a few moments. Please keep this page open.' : 'Feedback appears below, right on this page.'}</p>
      </form>

      {result && <section className="mt-10 space-y-7" aria-live="polite" aria-label="Resume feedback">
        <div className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-7 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center">
          <ScoreCircle score={result.overall_score} />
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">{mode === 'ai' ? 'AI feedback' : 'Quick local feedback'}</p>
            <h2 className="mt-2 text-2xl font-black">The verdict</h2>
            <p className="mt-3 leading-7 text-slate-700 dark:text-slate-200">{result.roast_summary}</p>
            {mode === 'local' && <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">This preview uses simple text checks. Add a Groq API key for AI-written feedback.</p>}
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2">{result.sections.map((section, index) => <FeedbackCard key={`${section.name}-${index}`} section={section} />)}</div>
        <div className="grid gap-5 md:grid-cols-2">
          <List title="Strengths" items={result.top_strengths} />
          <List title="Things to improve" items={result.top_weaknesses} />
          {result.cringe_phrases.length > 0 && <List title="Cringe phrases" items={result.cringe_phrases} />}
          <List title="Next steps" items={result.action_items} />
        </div>
      </section>}
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"><h3 className="text-xl font-bold">{title}</h3><ul className="mt-4 list-disc space-y-2 pl-5 leading-7 text-slate-700 dark:text-slate-200">{items.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul></div>;
}
