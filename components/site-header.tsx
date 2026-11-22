import Link from 'next/link';
import { auth } from '@/lib/auth';
import { AuthButton } from '@/components/auth-button';

export async function SiteHeader() {
  const session = await auth();
  return (
    <header className="border-b border-slate-200 bg-white/85 dark:border-slate-800 dark:bg-slate-950/85">
      <nav aria-label="Main navigation" className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="text-lg font-black tracking-tight">Resume<span className="text-violet-600">Roaster</span></Link>
        <div className="flex items-center gap-3 sm:gap-6">
          {session?.user && <>
            <Link href="/roast" className="text-sm font-medium hover:text-violet-600">New roast</Link>
            <Link href="/history" className="text-sm font-medium hover:text-violet-600">History</Link>
          </>}
          <AuthButton signedIn={Boolean(session?.user)} />
        </div>
      </nav>
    </header>
  );
}
