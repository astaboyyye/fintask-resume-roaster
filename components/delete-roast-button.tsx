'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function DeleteRoastButton({ id, redirectTo }: { id: string; redirectTo?: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function remove() {
    setPending(true);
    setError('');
    try {
      const response = await fetch(`/api/roasts/${id}`, { method: 'DELETE' });
      if (!response.ok && response.status !== 404) throw new Error();
      if (redirectTo) router.push(redirectTo);
      router.refresh();
    } catch {
      setError('Could not delete. Try again.');
      setPending(false);
    }
  }

  if (!confirming) {
    return <button type="button" onClick={() => setConfirming(true)} className="rounded-lg px-3 py-1.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40">Delete</button>;
  }

  return (
    <span className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-slate-600 dark:text-slate-300">Delete this roast?</span>
      <button type="button" disabled={pending} onClick={() => void remove()} className="rounded-lg bg-rose-600 px-3 py-1.5 font-semibold text-white hover:bg-rose-700 disabled:opacity-60">{pending ? 'Deleting…' : 'Delete'}</button>
      <button type="button" disabled={pending} onClick={() => setConfirming(false)} className="rounded-lg px-3 py-1.5 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
      {error && <span role="alert" className="text-rose-600 dark:text-rose-400">{error}</span>}
    </span>
  );
}
