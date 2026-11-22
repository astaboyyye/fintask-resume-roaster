'use client';

import { useState } from 'react';
import { signIn, signOut } from 'next-auth/react';

export function AuthButton({ signedIn }: { signedIn: boolean }) {
  const [error, setError] = useState('');

  async function handleClick() {
    setError('');
    try {
      if (signedIn) await signOut({ callbackUrl: '/' });
      else await signIn('github', { callbackUrl: '/roast' });
    } catch {
      setError('Authentication failed. Please try again.');
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button onClick={() => void handleClick()} className={signedIn
        ? 'rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800'
        : 'rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700'}>
        {signedIn ? 'Sign out' : 'Sign in with GitHub'}
      </button>
      {error && <span role="alert" className="text-xs text-rose-600">{error}</span>}
    </div>
  );
}
