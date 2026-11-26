import { FeedbackCard } from '@/components/feedback-card';
import { ScoreCircle } from '@/components/score-circle';
import type { RoastResult } from '@/lib/roast-schema';

export function RoastResultView({ result, mode }: { result: RoastResult; mode: 'ai' | 'local' }) {
  return (
    <section className="space-y-7" aria-label="Resume feedback">
      <div className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-7 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center">
        <ScoreCircle score={result.overall_score} />
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">{mode === 'ai' ? 'Claude AI feedback' : 'Quick local feedback'}</p>
          <h2 className="mt-2 text-2xl font-black">The verdict</h2>
          <p className="mt-3 leading-7 text-slate-700 dark:text-slate-200">{result.roast_summary}</p>
          {mode === 'local' && <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">AI feedback is not configured on this server, so this preview uses simple text checks.</p>}
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2">{result.sections.map((section, index) => <FeedbackCard key={`${section.name}-${index}`} section={section} />)}</div>
      <div className="grid gap-5 md:grid-cols-2">
        {result.top_strengths.length > 0 && <List title="Strengths" items={result.top_strengths} />}
        {result.top_weaknesses.length > 0 && <List title="Things to improve" items={result.top_weaknesses} />}
        {result.cringe_phrases.length > 0 && <List title="Cringe phrases" items={result.cringe_phrases} />}
        <List title="Next steps" items={result.action_items} />
      </div>
    </section>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-xl font-bold">{title}</h3>
      <ul className="mt-4 list-disc space-y-2 pl-5 leading-7 text-slate-700 dark:text-slate-200">{items.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul>
    </div>
  );
}
