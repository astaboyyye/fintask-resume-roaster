import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site-header';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'AI Resume Roaster', template: '%s | AI Resume Roaster' },
  description: 'Funny, useful Claude AI feedback for your resume.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
