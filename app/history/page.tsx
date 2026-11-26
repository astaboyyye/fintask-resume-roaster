import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { DeleteRoastButton } from '@/components/delete-roast-button';
import { getCurrentUser } from '@/lib/auth';
import { DatabaseError, isDatabaseConfigured, listRoasts, type RoastSummary } from '@/lib/db';

export const metadata: Metadata = { title: 'History' };
export const dynamic = 'force-dynamic';

const dateFormat = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' });

export default async function HistoryPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/signin?callbackUrl=/history');

  let roasts: RoastSummary[] = [];
  let loadError = '';
  if (isDatabaseConfigured()) {
    try {
      roasts = await listRoasts(user.id);
    } catch (error) {
      if (!(error instanceof DatabaseError)) throw error;
      loadError = 'We could not load your history right now. Please refresh to try again.';
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Your roasts</h1>
          <p className="mt-3 text-slate-600 dark:text-slate-300">Only you can see these. Times are shown in UTC.</p>
        </div>
        <Link href="/" className="rounded-xl bg-violet-600 px-5 py-2.5 font-bold text-white hover:bg-violet-700">New roast</Link>
      </div>

      {!isDatabaseConfigured() ? (
        <Notice>Saving is not configured on this server, so there is no history yet.</Notice>
      ) : loadError ? (
        <Notice>{loadError}</Notice>
      ) : roasts.length === 0 ? (
        <Notice>No roasts yet. <Link href="/" className="font-bold underline">Upload your first resume</Link>.</Notice>
      ) : (
        <ul className="mt-8 space-y-3">
          {roasts.map((roast) => (
            <li key={roast.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
              <Link href={`/roast/${roast.id}`} className="flex min-w-0 items-center gap-4 hover:opacity-80">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-violet-100 text-lg font-black text-violet-800 dark:bg-violet-900/40 dark:text-violet-200">{roast.score}</span>
                <span className="min-w-0">
                  <span className="block truncate font-bold">{roast.fileName}</span>
                  <span className="block text-sm text-slate-500 dark:text-slate-400">{dateFormat.format(new Date(roast.createdAt))} · {roast.mode === 'ai' ? 'Claude AI' : 'Local preview'}</span>
                </span>
              </Link>
              <DeleteRoastButton id={roast.id} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return <p className="mt-8 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-600 dark:border-slate-700 dark:text-slate-300">{children}</p>;
}
