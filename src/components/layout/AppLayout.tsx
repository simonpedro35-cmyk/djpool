'use client';

import { ReactNode } from 'react';
import Link from 'next/link';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-void text-text">
      
      {/* Sidebar */}
      <aside className="w-64 bg-panel border-r border-border flex flex-col">
        <div className="p-6 font-display text-lg font-bold">
          DJ<span className="text-acid">POOL</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 text-sm">
          <Link href="/dashboard" className="block hover:text-acid">
            Dashboard
          </Link>
          <Link href="/dashboard/library" className="block hover:text-acid">
            Library
          </Link>
          <Link href="/admin" className="block hover:text-acid">
            Admin
          </Link>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1">

        {/* Header */}
        <header className="h-14 border-b border-border flex items-center justify-between px-6">
          <span className="text-sm text-dim">Welcome back</span>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>

        {/* Player */}
        <div className="h-20 border-t border-border flex items-center px-6 bg-panel">
          <span className="text-sm text-dim">No track playing</span>
        </div>

      </div>
    </div>
  );
}