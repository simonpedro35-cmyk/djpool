import type { Metadata } from 'next';
import './globals.css';
import ThemeProvider from '@/components/providers/ThemeProvider';

export const metadata: Metadata = {
  title: 'DJ Pool — Professional Record Pool',
  description: 'Exclusive music library for professional DJs',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen font-body antialiased bg-void text-text">
        <ThemeProvider>
          <main className="flex-1">{children}</main>

          <footer className="text-center text-xs text-dim py-4 border-t border-border">
            this site is owned by{' '}
            <span className="text-acid font-semibold">
              Grandhamusic &amp; Correa.mp4
            </span>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}