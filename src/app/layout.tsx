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
      </body>
    </html>
  );
}
