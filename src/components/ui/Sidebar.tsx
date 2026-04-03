'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types';
import {
  LayoutGrid,
  Upload,
  LogOut,
  ChevronRight,
  Disc3,
  ShieldCheck,
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
      ? [{ href: '/admin', label: 'Admin Upload', icon: Upload }]
      : []),
  ];

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-[#0b0f14] border-r border-white/5">
      <div className="px-6 py-6 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-acid/10 border border-acid/20 flex items-center justify-center shadow-[0_0_30px_rgba(200,255,0,0.08)]">
            <Disc3 className="w-5 h-5 text-acid" />
          </div>
          <div>
            <p className="font-display text-lg leading-none font-bold text-bright">
              DJ<span className="text-acid">POOL</span>
            </p>
            <p className="text-[11px] text-dim mt-1 tracking-[0.2em] uppercase">
              Record Pool
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-5 space-y-2">
        <p className="px-3 text-[10px] font-mono uppercase tracking-[0.25em] text-muted mb-3">
          Navigation
        </p>

        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');

          return (
            <Link
              key={href}
              href={href}
              className={[
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 group border',
                active
                  ? 'bg-acid/10 text-acid border-acid/20 shadow-[0_0_20px_rgba(200,255,0,0.05)]'
                  : 'text-dim hover:text-text hover:bg-white/[0.03] border-transparent hover:border-white/5',
              ].join(' ')}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="font-medium">{label}</span>
              {active && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 pb-5 pt-4 border-t border-white/5">
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-4 mb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-bright truncate font-medium">
                {profile?.email ?? 'Unknown user'}
              </p>
              <p className="text-[11px] text-dim mt-1">Signed in account</p>
            </div>

            <span
              className={[
                'inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-full border whitespace-nowrap',
                profile?.role === 'admin'
                  ? 'bg-acid/10 text-acid border-acid/20'
                  : 'bg-white/[0.04] text-dim border-white/10',
              ].join(' ')}
            >
              {profile?.role === 'admin' && <ShieldCheck className="w-3 h-3" />}
              {profile?.role ?? 'user'}
            </span>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-4 py-3 text-sm text-dim hover:text-warn hover:bg-warn/5 rounded-xl transition-all border border-transparent hover:border-warn/10"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}