'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types';
import {
  LayoutGrid, Upload, LogOut, ChevronRight, Music2, Users
} from 'lucide-react';

interface SidebarProps {
  profile: Profile | null;
}

export default function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  const navItems = [
    { href: '/dashboard', label: 'Library', icon: LayoutGrid },
    ...(profile?.role === 'admin'
      ? [{ href: '/admin', label: 'Upload', icon: Upload }]
      : []
    ),
  ];

  return (
    <aside className="hidden md:flex w-52 shrink-0 flex-col bg-surface border-r border-border">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex items-end gap-[2px] h-4">
            {[40, 70, 100, 60, 85].map((h, i) => (
              <div
                key={i}
                className="eq-bar"
                style={{ height: `${h}%`, animationDelay: `${i * 0.12}s`, width: '2px' }}
              />
            ))}
          </div>
          <span className="font-display text-base font-bold text-bright">
            DJ<span className="text-acid">POOL</span>
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors group
                ${active
                  ? 'bg-acid/10 text-acid'
                  : 'text-dim hover:text-text hover:bg-panel'
                }
              `}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="font-medium">{label}</span>
              {active && <ChevronRight className="w-3 h-3 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className="px-3 pb-4 border-t border-border pt-4 space-y-2">
        <div className="px-3 py-2">
          <p className="text-xs text-text truncate">{profile?.email}</p>
          <span className={`
            inline-block text-[10px] font-mono uppercase tracking-wider mt-1 px-1.5 py-0.5 rounded-sm
            ${profile?.role === 'admin' ? 'bg-acid/15 text-acid' : 'bg-muted/50 text-dim'}
          `}>
            {profile?.role ?? 'user'}
          </span>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm text-dim hover:text-warn transition-colors rounded-sm"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
