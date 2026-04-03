import { createClient } from '@/lib/supabase/server';
import TrackTable from '@/components/tracks/TrackTable';
import FilterBar from '@/components/tracks/FilterBar';
import type { FilterState, TrackView, Genre } from '@/types';
import { Suspense } from 'react';

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

  let query = supabase
    .from('tracks_view')
    .select('*');

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
  if (error) { console.error(error); return []; }
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
    search:      sp.search ?? '',
    genre_id:    sp.genre_id ?? '',
    bpm_min:     sp.bpm_min ?? '',
    bpm_max:     sp.bpm_max ?? '',
    musical_key: sp.musical_key ?? '',
    track_type:  sp.track_type ?? '',
    sort_by:     (sp.sort_by as FilterState['sort_by']) || 'created_at',
    sort_dir:    (sp.sort_dir as FilterState['sort_dir']) || 'desc',
  };

  const [tracks, { data: genres }] = await Promise.all([
    getTracks(filters),
    supabase.from('genres').select('*').order('name'),
  ]);

  return (
    <div className="p-5 md:p-8 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-bright">Track Library</h1>
        <p className="text-dim text-sm mt-1">
          {tracks.length} track{tracks.length !== 1 ? 's' : ''} available
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <Suspense>
          <FilterBar genres={(genres ?? []) as Genre[]} filters={filters} />
        </Suspense>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-sm overflow-hidden">
        <TrackTable tracks={tracks} />
      </div>
    </div>
  );
}
