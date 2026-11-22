import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'AI Resume Roaster', template: '%s | AI Resume Roaster' },
  description: 'Funny, useful AI feedback for your resume.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
