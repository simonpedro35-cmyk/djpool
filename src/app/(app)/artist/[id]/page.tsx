import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import TrackTable from '@/components/tracks/TrackTable';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { TrackView } from '@/types';

export default async function ArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: artist }, { data: tracks }] = await Promise.all([
    supabase.from('artists').select('*').eq('id', id).single(),
    supabase.from('tracks_view').select('*').eq('artist_id', id).order('created_at', { ascending: false }),
  ]);

  if (!artist) notFound();

  return (
    <div className="p-5 md:p-8 animate-fade-in">
      <Link href="/dashboard" className="flex items-center gap-2 text-dim hover:text-acid text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to library
      </Link>

      <div className="mb-8">
        <p className="text-[10px] font-mono text-dim uppercase tracking-widest mb-1">Artist</p>
        <h1 className="font-display text-3xl font-bold text-bright">{artist.name}</h1>
        <p className="text-dim text-sm mt-2">{tracks?.length ?? 0} track{tracks?.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="bg-surface border border-border rounded-sm overflow-hidden">
        <TrackTable tracks={(tracks ?? []) as TrackView[]} />
      </div>
    </div>
  );
}
