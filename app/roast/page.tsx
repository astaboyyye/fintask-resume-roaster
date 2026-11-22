import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { UploadDropzone } from '@/components/upload-dropzone';

export const metadata: Metadata = { title: 'New roast' };

export default async function RoastPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/api/auth/signin?callbackUrl=%2Froast');
  return (
    <main className="mx-auto max-w-5xl px-5 py-14 sm:py-20">
      <div className="mb-10 max-w-2xl">
        <p className="text-sm font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">New roast</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Let&apos;s talk about your resume.</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">Upload a PDF and get a candid review with scores, strengths, weak spots, and practical next steps.</p>
      </div>
      <UploadDropzone />
      <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">Your resume text and feedback are saved to your account so you can revisit them in History. Do not upload sensitive information you do not want to store.</p>
    </main>
  );
}
