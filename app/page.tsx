import Link from 'next/link';
import { UploadDropzone } from '@/components/upload-dropzone';
import { getCurrentUser } from '@/lib/auth';
import { isDatabaseConfigured } from '@/lib/db';
import { roastLimitPerHour } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <main className="mx-auto max-w-5xl px-5 py-12 sm:py-20">
        <p className="text-sm font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">Finlatics · Project 2</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-black tracking-tight sm:text-6xl">Get your resume roasted by Claude.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">Upload a PDF and get a score, a lighthearted roast, and specific fixes for every section. Your past roasts are saved privately to your account.</p>
        <Link href="/signin" className="mt-8 inline-block rounded-xl bg-violet-600 px-7 py-3.5 font-bold text-white hover:bg-violet-700">Sign in to start</Link>
        <ul className="mt-14 grid gap-5 sm:grid-cols-3">
          <Feature title="1. Upload" text="Drop a text-based PDF resume, up to 4 MB." />
          <Feature title="2. Get roasted" text="Claude scores each section and pairs every jab with a concrete fix." />
          <Feature title="3. Improve" text="Revisit your saved roasts and track your score as you edit." />
        </ul>
      </main>
    );
  }

  const savingEnabled = isDatabaseConfigured();

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 sm:py-16">
      <div className="mb-9 max-w-2xl">
        <p className="text-sm font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">Finlatics · Project 2</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">AI Resume Roaster</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">Hi {user.name?.split(' ')[0] ?? 'there'}. Upload your resume and get a quick, honest roast with practical fixes.</p>
      </div>
      <UploadDropzone savingEnabled={savingEnabled} />
      <p className="mt-5 text-sm leading-6 text-slate-500 dark:text-slate-400">
        PDF only, up to 4 MB, {roastLimitPerHour()} roasts per hour. The PDF file itself is never stored.{' '}
        {savingEnabled ? 'The extracted text and feedback are saved to your account so you can revisit them, and you can delete them at any time.' : 'Saving is not configured on this server, so nothing is stored.'}
      </p>
    </main>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="mt-2 leading-7 text-slate-600 dark:text-slate-300">{text}</p>
    </li>
  );
}
