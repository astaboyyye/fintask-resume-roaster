import Link from 'next/link';
import { auth } from '@/lib/auth';

const steps = [
  { title: 'Drop your PDF', text: 'Upload a text-based resume, up to 5 MB.' },
  { title: 'Get a useful roast', text: 'We spot vague claims, missed impact, and wording that needs work.' },
  { title: 'Make it stronger', text: 'Every critique comes with a specific fix you can use.' },
];

export default async function HomePage() {
  const session = await auth();
  return (
    <main>
      <section className="relative overflow-hidden bg-slate-950 px-5 py-24 text-white sm:py-32">
        <div aria-hidden="true" className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-violet-600/25 blur-3xl" />
        <div className="relative mx-auto max-w-6xl">
          <p className="mb-6 inline-block rounded-full border border-violet-400/40 bg-violet-400/10 px-4 py-1.5 text-sm font-semibold text-violet-200">A little heat. A better resume.</p>
          <h1 className="max-w-4xl text-5xl font-black leading-tight tracking-tight sm:text-7xl">Your resume called. It wants <span className="text-violet-400">honest feedback.</span></h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">Get a funny, constructive review of your PDF resume. See what works, what makes a recruiter pause, and exactly what to improve next.</p>
          <Link href={session?.user ? '/roast' : '/api/auth/signin?callbackUrl=%2Froast'} className="mt-9 inline-flex rounded-xl bg-violet-500 px-6 py-3 font-bold text-white shadow-lg shadow-violet-950/40 transition hover:bg-violet-400">
            {session?.user ? 'Roast my resume' : 'Sign in to get roasted'}
          </Link>
          <p className="mt-4 text-sm text-slate-400">Private to your account · Five roasts per hour · PDF only</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">How it works</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Feedback you can actually use</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {steps.map((step, index) => (
            <article key={step.title} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 font-black text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">{index + 1}</span>
              <h3 className="text-xl font-bold">{step.title}</h3>
              <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">{step.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="border-t border-slate-200 bg-white px-5 py-16 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-2xl font-black">Ready for the truth?</h2><p className="mt-2 text-slate-600 dark:text-slate-300">Bring the PDF. We will bring the punchlines and the fixes.</p></div>
          <Link href={session?.user ? '/roast' : '/api/auth/signin?callbackUrl=%2Froast'} className="w-fit rounded-xl bg-violet-600 px-6 py-3 font-bold text-white transition hover:bg-violet-700">Start a roast</Link>
        </div>
      </section>
    </main>
  );
}
