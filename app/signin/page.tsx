import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SignInButtons } from '@/components/auth-buttons';
import { enabledProviders, getCurrentUser } from '@/lib/auth';

export const metadata: Metadata = { title: 'Sign in' };
export const dynamic = 'force-dynamic';

const ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked: 'That email is already linked to another sign-in method. Use the one you used before.',
  AccessDenied: 'Sign-in was cancelled or denied.',
  Configuration: 'Sign-in is not configured correctly on this server.',
};

function safeCallback(value: string | undefined): string {
  // Only allow same-site paths so the sign-in flow cannot redirect elsewhere.
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/';
}

export default async function SignInPage({ searchParams }: { searchParams: { callbackUrl?: string; error?: string } }) {
  const callbackUrl = safeCallback(searchParams.callbackUrl);
  if (await getCurrentUser()) redirect(callbackUrl);

  const error = searchParams.error ? ERROR_MESSAGES[searchParams.error] ?? 'Sign-in failed. Please try again.' : '';

  return (
    <main className="mx-auto max-w-xl px-5 py-16 sm:py-24">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900 sm:p-10">
        <h1 className="text-3xl font-black tracking-tight">Sign in</h1>
        <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">Sign in to roast your resume and keep a private history of your results.</p>
        {error && <p role="alert" className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{error}</p>}
        <div className="mt-7">
          {enabledProviders.length > 0 ? (
            <SignInButtons providers={enabledProviders} callbackUrl={callbackUrl} />
          ) : (
            <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">No sign-in provider is configured. Set <code>GITHUB_ID</code> and <code>GITHUB_SECRET</code> (or the Google equivalents) and restart the server.</p>
          )}
        </div>
        <p className="mt-7 text-sm text-slate-500 dark:text-slate-400">We only use your name, email, and avatar to identify your account.</p>
      </div>
    </main>
  );
}
