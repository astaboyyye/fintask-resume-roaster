import { UploadDropzone } from '@/components/upload-dropzone';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-10 sm:py-16">
      <div className="mb-9 max-w-2xl">
        <p className="text-sm font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">Finlatics · Project 2</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">AI Resume Roaster</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">Upload your resume and get a quick, honest roast with practical fixes. No account needed.</p>
      </div>
      <UploadDropzone />
      <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">PDF only, up to 5 MB. Your resume is processed for this request and is not saved.</p>
    </main>
  );
}
