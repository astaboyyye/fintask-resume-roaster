import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-5 py-24 text-center">
      <h1 className="text-3xl font-black">Not found</h1>
      <p className="mt-3 text-slate-600 dark:text-slate-300">This page or roast does not exist, or it belongs to another account.</p>
      <Link href="/" className="mt-6 inline-block rounded-xl bg-violet-600 px-5 py-2.5 font-bold text-white hover:bg-violet-700">Go home</Link>
    </main>
  );
}
