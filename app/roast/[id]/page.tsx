import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { roastSchema } from '@/lib/roast-schema';
import { FeedbackCard } from '@/components/feedback-card';
import { ScoreCircle } from '@/components/score-circle';

export const metadata: Metadata = { title: 'Your roast' };

function ListCard({ title, items, tone }: { title: string; items: string[]; tone: 'green' | 'amber' | 'violet' }) {
  const colors = { green: 'border-emerald-200 dark:border-emerald-900', amber: 'border-amber-200 dark:border-amber-900', violet: 'border-violet-200 dark:border-violet-900' };
  return (
    <section className={`rounded-2xl border bg-white p-6 dark:bg-slate-900 ${colors[tone]}`}>
      <h2 className="text-xl font-bold">{title}</h2>
      {items.length ? <ul className="mt-4 list-disc space-y-3 pl-5 leading-7 text-slate-700 dark:text-slate-200">{items.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul> : <p className="mt-4 text-slate-500">Nothing to call out here.</p>}
    </section>
  );
}

export default async function ResultPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect(`/api/auth/signin?callbackUrl=${encodeURIComponent(`/roast/${params.id}`)}`);

  const roast = await prisma.roast.findFirst({
    where: { id: params.id, userId: session.user.id },
    select: { fileName: true, createdAt: true, resultJson: true },
  });
  if (!roast) notFound();

  const parsed = roastSchema.safeParse(roast.resultJson);
  if (!parsed.success) notFound();
  const result = parsed.data;

  return (
    <main className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <Link href="/history" className="text-sm font-semibold text-violet-700 hover:underline dark:text-violet-300">← Back to history</Link>
        <Link href="/roast" className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-700">Roast another PDF</Link>
      </div>
      <section className="flex flex-col gap-8 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:p-10">
        <ScoreCircle score={result.overall_score} />
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">The verdict</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Your resume roast</h1>
          <p className="mt-3 break-all text-sm text-slate-500 dark:text-slate-400">{roast.fileName} · {roast.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="mt-5 text-lg leading-8 text-slate-700 dark:text-slate-200">{result.roast_summary}</p>
        </div>
      </section>

      <section className="mt-12" aria-labelledby="sections-title">
        <h2 id="sections-title" className="mb-6 text-2xl font-black tracking-tight">Section by section</h2>
        <div className="grid gap-5 md:grid-cols-2">{result.sections.map((section, index) => <FeedbackCard key={`${section.name}-${index}`} section={section} />)}</div>
      </section>

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        <ListCard title="What works" items={result.top_strengths} tone="green" />
        <ListCard title="What needs work" items={result.top_weaknesses} tone="amber" />
        <ListCard title="Cringe phrases" items={result.cringe_phrases} tone="amber" />
        <ListCard title="Your action plan" items={result.action_items} tone="violet" />
      </div>
    </main>
  );
}
