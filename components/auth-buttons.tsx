'use client';

import { signIn, signOut } from 'next-auth/react';
import { useState } from 'react';

type ProviderOption = { id: string; name: string };

export function SignInButtons({ providers, callbackUrl = '/' }: { providers: ProviderOption[]; callbackUrl?: string }) {
  const [pending, setPending] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {providers.map((provider) => (
        <button
          key={provider.id}
          type="button"
          disabled={pending !== null}
          onClick={() => { setPending(provider.id); void signIn(provider.id, { callbackUrl }); }}
          className="rounded-xl bg-violet-600 px-6 py-3 font-bold text-white hover:bg-violet-700 disabled:cursor-wait disabled:opacity-60"
        >
          {pending === provider.id ? 'Redirecting…' : `Continue with ${provider.name}`}
        </button>
      ))}
    </div>
  );
}

export function SignOutButton() {
  const [pending, setPending] = useState(false);
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => { setPending(true); void signOut({ callbackUrl: '/' }); }}
      className="rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-60 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      {pending ? 'Signing out…' : 'Sign out'}
    </button>
  );
}
