import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import PlayerBar from '@/components/player/PlayerBar';
import { PlayerProvider } from '@/components/player/PlayerContext';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <PlayerProvider>
      <div className="flex h-screen bg-void text-text overflow-hidden">
        <Sidebar profile={profile} />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gradient-to-b from-panel to-void">
          <header className="h-16 border-b border-border/60 bg-panel/80 backdrop-blur-sm flex items-center justify-between px-6">
            <div>
              <h1 className="font-display text-lg font-bold text-bright">
                Welcome back
              </h1>
              <p className="text-xs text-dim">
                Discover, preview and download tracks
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm text-bright">{profile?.email ?? user.email}</p>
              <p className="text-xs uppercase tracking-widest text-acid">
                {profile?.role ?? 'user'}
              </p>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-6 py-6">
            {children}
          </main>

          <div className="border-t border-border/60 bg-panel/95 backdrop-blur-sm">
            <PlayerBar />
          </div>
        </div>
      </div>
    </PlayerProvider>
  );
}
