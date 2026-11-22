import type { RoastResult } from '@/lib/roast-schema';

type Section = RoastResult['sections'][number];

export function FeedbackCard({ section }: { section: Section }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-5 flex items-start justify-between gap-4">
        <h3 className="text-xl font-bold">{section.name}</h3>
        <span className="shrink-0 rounded-full bg-violet-100 px-3 py-1 text-sm font-bold text-violet-800 dark:bg-violet-900/40 dark:text-violet-200">{section.score}/10</span>
      </div>
      <p className="leading-7 text-slate-700 dark:text-slate-200">{section.roast}</p>
      <div className="mt-5 rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/30">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">The fix</p>
        <p className="mt-2 leading-7 text-slate-700 dark:text-slate-200">{section.fix}</p>
      </div>
    </article>
  );
}
