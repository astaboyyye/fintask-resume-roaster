export function ScoreCircle({ score, outOf = 100 }: { score: number; outOf?: number }) {
  const percentage = Math.max(0, Math.min(100, (score / outOf) * 100));
  return (
    <div className="relative flex h-40 w-40 shrink-0 items-center justify-center rounded-full p-2" style={{ background: `conic-gradient(#8b5cf6 ${percentage}%, #cbd5e1 ${percentage}%)` }} aria-label={`Score: ${score} out of ${outOf}`}>
      <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white dark:bg-slate-900">
        <span className="text-5xl font-black tracking-tight">{score}</span>
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">out of {outOf}</span>
      </div>
    </div>
  );
}
