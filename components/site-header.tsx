import Link from 'next/link';
import { SignOutButton } from '@/components/auth-buttons';
import { getCurrentUser } from '@/lib/auth';

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-3">
        <Link href="/" className="text-lg font-black tracking-tight">🔥 Resume Roaster</Link>
        {user ? (
          <nav className="flex flex-wrap items-center gap-1 sm:gap-2" aria-label="Main">
            <Link href="/" className="rounded-lg px-3 py-1.5 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800">New roast</Link>
            <Link href="/history" className="rounded-lg px-3 py-1.5 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800">History</Link>
            <span className="hidden items-center gap-2 pl-2 text-sm text-slate-500 dark:text-slate-400 sm:flex">
              {user.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt="" width={28} height={28} className="h-7 w-7 rounded-full" />
              )}
              <span className="max-w-[10rem] truncate">{user.name ?? user.email}</span>
            </span>
            <SignOutButton />
          </nav>
        ) : (
          <Link href="/signin" className="rounded-lg bg-violet-600 px-4 py-1.5 text-sm font-bold text-white hover:bg-violet-700">Sign in</Link>
        )}
      </div>
    </header>
  );
}
