import { createClient } from '@/lib/supabase/server';
import TrackTable from '@/components/tracks/TrackTable';
import FilterBar from '@/components/tracks/FilterBar';
import type { FilterState, TrackView, Genre } from '@/types';
import { Suspense } from 'react';
import { Music4, Disc3, Layers3 } from 'lucide-react';

interface SearchParams {
  search?: string;
  genre_id?: string;
  bpm_min?: string;
  bpm_max?: string;
  musical_key?: string;
  track_type?: string;
  sort_by?: string;
  sort_dir?: string;
}

async function getTracks(filters: FilterState): Promise<TrackView[]> {
  const supabase = await createClient();

  let query = supabase.from('tracks_view').select('*');

  if (filters.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,artist_name.ilike.%${filters.search}%`
    );
  }
  if (filters.genre_id) {
    query = query.eq('genre_id', filters.genre_id);
  }
  if (filters.bpm_min) {
    query = query.gte('bpm', parseInt(filters.bpm_min));
  }
  if (filters.bpm_max) {
    query = query.lte('bpm', parseInt(filters.bpm_max));
  }
  if (filters.musical_key) {
    query = query.eq('musical_key', filters.musical_key);
  }
  if (filters.track_type) {
    query = query.eq('track_type', filters.track_type);
  }

  const sortCol = filters.sort_by || 'created_at';
  const sortAsc = filters.sort_dir === 'asc';
  query = query.order(sortCol, { ascending: sortAsc });

  const { data, error } = await query.limit(200);
  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []) as TrackView[];
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();

  const filters: FilterState = {
    search: sp.search ?? '',
    genre_id: sp.genre_id ?? '',
    bpm_min: sp.bpm_min ?? '',
    bpm_max: sp.bpm_max ?? '',
    musical_key: sp.musical_key ?? '',
    track_type: sp.track_type ?? '',
    sort_by: (sp.sort_by as FilterState['sort_by']) || 'created_at',
    sort_dir: (sp.sort_dir as FilterState['sort_dir']) || 'desc',
  };

  const [tracks, { data: genres }] = await Promise.all([
    getTracks(filters),
    supabase.from('genres').select('*').order('name'),
  ]);

  const genreCount = (genres ?? []).length;
  const uniqueArtists = new Set(
    tracks.map((track) => track.artist_name).filter(Boolean)
  ).size;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8 animate-fade-in space-y-6">
      <section className="rounded-3xl border border-white/5 bg-gradient-to-br from-panel to-[#0b0f14] p-6 md:p-8 shadow-[0_20px_80px_rgba(0,0,0,0.28)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-acid font-mono mb-3">
              <Music4 className="w-4 h-4" />
              DJ Pool Library
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-bold text-bright leading-tight">
              Discover, preview and download tracks
            </h1>

            <p className="text-dim text-sm md:text-base mt-3 max-w-2xl">
              Browse your full record pool, filter by genre, BPM, key and type,
              then stream previews and grab full downloads in one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 min-w-[140px]">
              <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-dim">
                Tracks
              </p>
              <p className="text-2xl font-bold text-bright mt-2">{tracks.length}</p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 min-w-[140px]">
              <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-dim">
                Artists
              </p>
              <p className="text-2xl font-bold text-bright mt-2">{uniqueArtists}</p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 min-w-[140px]">
              <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-dim">
                Genres
              </p>
              <p className="text-2xl font-bold text-bright mt-2">{genreCount}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/5 bg-[#0d1218] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.2)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-acid/10 border border-acid/20 flex items-center justify-center">
              <Disc3 className="w-5 h-5 text-acid" />
            </div>
            <div>
              <p className="text-sm font-semibold text-bright">Fast previews</p>
              <p className="text-xs text-dim">Stream clips before downloading</p>
            </div>
          </div>
          <p className="text-sm text-dim">
            Audition tracks instantly and keep your digging workflow fast.
          </p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#0d1218] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.2)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-cyan/10 border border-cyan/20 flex items-center justify-center">
              <Layers3 className="w-5 h-5 text-cyan" />
            </div>
            <div>
              <p className="text-sm font-semibold text-bright">Metadata filtering</p>
              <p className="text-xs text-dim">Sort by BPM, key, genre and type</p>
            </div>
          </div>
          <p className="text-sm text-dim">
            Find the right version for your set faster with precise filters.
          </p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#0d1218] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.2)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-magenta/10 border border-magenta/20 flex items-center justify-center">
              <Music4 className="w-5 h-5 text-magenta" />
            </div>
            <div>
              <p className="text-sm font-semibold text-bright">DJ-ready library</p>
              <p className="text-xs text-dim">Built for selectors, not casual listeners</p>
            </div>
          </div>
          <p className="text-sm text-dim">
            Clean rows, fast downloads and a workflow made for record pool use.
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-white/5 bg-[#0d1218] p-5 md:p-6 shadow-[0_20px_80px_rgba(0,0,0,0.22)]">
        <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
          <div>
            <h2 className="text-lg font-semibold text-bright">Filter collection</h2>
            <p className="text-sm text-dim mt-1">
              Narrow down your library by sound, tempo and category.
            </p>
          </div>

          <div className="text-xs font-mono uppercase tracking-[0.22em] text-dim">
            {tracks.length} result{tracks.length !== 1 ? 's' : ''}
          </div>
        </div>

        <Suspense>
          <FilterBar genres={(genres ?? []) as Genre[]} filters={filters} />
        </Suspense>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-semibold text-bright">Available tracks</h2>
            <p className="text-sm text-dim mt-1">
              Preview, browse and download from your current library.
            </p>
          </div>
        </div>

        <TrackTable tracks={tracks} />
      </section>
    </div>
  );
}
