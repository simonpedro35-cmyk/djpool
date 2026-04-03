import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DJ Pool — Professional Record Pool',
  description: 'Exclusive music library for professional DJs',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-void min-h-screen text-text font-body antialiased">
        {children}

        </main>

  <footer className="text-center text-xs text-dim py-4 border-t border-border">
    this site is owned by <span className="text-acid">Grandhamusic & Correa.mp4</span>
  </footer>
      </body>
    </html>
  );
}
