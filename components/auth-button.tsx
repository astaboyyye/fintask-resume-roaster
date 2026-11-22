'use client';

import { signIn, signOut } from 'next-auth/react';

export function AuthButton({ signedIn }: { signedIn: boolean }) {
  return signedIn ? (
    <button onClick={() => void signOut({ callbackUrl: '/' })} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
      Sign out
    </button>
  ) : (
    <button onClick={() => void signIn('github', { callbackUrl: '/roast' })} className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700">
      Sign in with GitHub
    </button>
  );
}
