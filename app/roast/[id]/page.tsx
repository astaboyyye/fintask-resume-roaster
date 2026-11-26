import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { DeleteRoastButton } from '@/components/delete-roast-button';
import { RoastResultView } from '@/components/roast-result';
import { getCurrentUser } from '@/lib/auth';
import { getRoast, isDatabaseConfigured } from '@/lib/db';

export const metadata: Metadata = { title: 'Saved roast' };
export const dynamic = 'force-dynamic';

const dateFormat = new Intl.DateTimeFormat('en-GB', { dateStyle: 'long', timeStyle: 'short', timeZone: 'UTC' });

export default async function SavedRoastPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect(`/signin?callbackUrl=/roast/${encodeURIComponent(params.id)}`);
  if (!isDatabaseConfigured()) notFound();

  // getRoast filters by owner, so another user's roast id behaves like a missing one.
  const roast = await getRoast(user.id, params.id);
  if (!roast) notFound();

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 sm:py-16">
      <Link href="/history" className="text-sm font-semibold text-violet-700 hover:underline dark:text-violet-300">← All roasts</Link>
      <div className="mb-8 mt-4 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="break-all text-3xl font-black tracking-tight">{roast.fileName}</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Roasted {dateFormat.format(new Date(roast.createdAt))} UTC</p>
        </div>
        <DeleteRoastButton id={roast.id} redirectTo="/history" />
      </div>
      <RoastResultView result={roast.result} mode={roast.mode} />
    </main>
  );
}
