import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import PlayerBar from '@/components/player/PlayerBar';
import { PlayerProvider } from '@/components/player/PlayerContext';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <PlayerProvider>
      <div className="flex h-screen bg-void overflow-hidden">
        <Sidebar profile={profile} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
          <PlayerBar />
        </div>
      </div>
    </PlayerProvider>
  );
}
