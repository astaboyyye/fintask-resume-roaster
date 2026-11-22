import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = { title: 'Roast history' };

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/api/auth/signin?callbackUrl=%2Fhistory');

  const roasts = await prisma.roast.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    select: { id: true, fileName: true, score: true, createdAt: true },
    take: 100,
  });

  return (
    <main className="mx-auto max-w-5xl px-5 py-14 sm:py-20">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">Your account</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Roast history</h1>
          <p className="mt-4 text-slate-600 dark:text-slate-300">Past feedback, ready whenever you want another look.</p>
        </div>
        <Link href="/roast" className="rounded-xl bg-violet-600 px-5 py-3 font-bold text-white hover:bg-violet-700">New roast</Link>
      </div>
      {roasts.length ? (
        <ul className="space-y-4">
          {roasts.map((roast) => (
            <li key={roast.id}>
              <Link href={`/roast/${roast.id}`} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-violet-400 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-violet-500">
                <span className="min-w-0"><strong className="block break-all text-lg">{roast.fileName}</strong><span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">{roast.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></span>
                <span className="rounded-full bg-violet-100 px-4 py-2 font-black text-violet-800 dark:bg-violet-900/40 dark:text-violet-200">{roast.score}/100</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-xl font-bold">No roasts yet</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Upload your first PDF to see feedback here.</p>
          <Link href="/roast" className="mt-5 inline-block font-bold text-violet-700 hover:underline dark:text-violet-300">Get your first roast</Link>
        </div>
      )}
    </main>
  );
}
