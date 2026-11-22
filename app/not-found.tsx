import Link from 'next/link';

export default function NotFound() {
  return <main className="mx-auto max-w-2xl px-5 py-24 text-center"><h1 className="text-4xl font-black">Roast not found</h1><p className="mt-4 text-slate-600 dark:text-slate-300">This roast does not exist, or it belongs to another account.</p><Link href="/history" className="mt-7 inline-block font-bold text-violet-700 hover:underline dark:text-violet-300">Go to history</Link></main>;
}
