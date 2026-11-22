import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site-header';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'AI Resume Roaster', template: '%s | AI Resume Roaster' },
  description: 'Funny, useful AI feedback for your resume.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <SiteHeader />
        {children}
        <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500 dark:border-slate-800">
          Finlatics ANDP · Project 2 · Resume feedback with a little bite
        </footer>
      </body>
    </html>
  );
}
