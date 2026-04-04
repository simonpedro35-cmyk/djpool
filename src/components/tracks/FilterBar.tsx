'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import { Search, SlidersHorizontal, X, Sparkles } from 'lucide-react';
import type { Genre, FilterState } from '@/types';
import { MUSICAL_KEYS, TRACK_TYPES } from '@/types';

interface FilterBarProps {
  genres: Genre[];
  filters: FilterState;
}

export default function FilterBar({ genres, filters }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      params.delete('page');

      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams]
  );

  const clearAll = () => {
    startTransition(() => {
      router.replace(pathname);
    });
  };

  const hasFilters = Object.entries(filters).some(
    ([k, v]) => !['sort_by', 'sort_dir'].includes(k) && v !== ''
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-acid mb-2">
            <Sparkles className="w-4 h-4" />
            Smart filtering
          </div>
          <p className="text-sm text-dim">
            Search your library and narrow results by metadata.
          </p>
        </div>

        {hasFilters && (
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-xs text-dim hover:text-warn hover:border-warn/20 hover:bg-warn/5 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Clear all filters
          </button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.6fr)]">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dim pointer-events-none" />
          <input
            type="text"
            placeholder="Search title or artist…"
            defaultValue={filters.search}
            onChange={(e) => update('search', e.target.value)}
            className="w-full bg-panel border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-text placeholder:text-muted focus:border-acid focus:outline-none transition-colors"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-panel px-4 py-3">
          <SlidersHorizontal className="w-4 h-4 text-dim shrink-0" />
          <select
            value={`${filters.sort_by}:${filters.sort_dir}`}
            onChange={(e) => {
              const [by, dir] = e.target.value.split(':');
              update('sort_by', by);
              update('sort_dir', dir);
            }}
            className="w-full bg-transparent text-sm text-text focus:outline-none cursor-pointer"
          >
            <option value="created_at:desc">Newest First</option>
            <option value="created_at:asc">Oldest First</option>
            <option value="bpm:asc">BPM ↑</option>
            <option value="bpm:desc">BPM ↓</option>
            <option value="download_count:desc">Most Downloaded</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
        {/* Genre */}
        <div className="rounded-2xl border border-white/10 bg-panel px-4 py-3">
          <label className="block text-[10px] font-mono uppercase tracking-[0.22em] text-dim mb-2">
            Genre
          </label>
          <select
            value={filters.genre_id}
            onChange={(e) => update('genre_id', e.target.value)}
            className="w-full bg-transparent text-sm text-text focus:outline-none cursor-pointer"
          >
            <option value="">All Genres</option>
            {genres.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        {/* BPM */}
        <div className="rounded-2xl border border-white/10 bg-panel px-4 py-3">
          <label className="block text-[10px] font-mono uppercase tracking-[0.22em] text-dim mb-2">
            BPM Range
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              defaultValue={filters.bpm_min}
              onChange={(e) => update('bpm_min', e.target.value)}
              className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-3 py-2 text-sm text-text placeholder:text-muted focus:border-acid focus:outline-none"
            />
            <span className="text-dim text-xs">—</span>
            <input
              type="number"
              placeholder="Max"
              defaultValue={filters.bpm_max}
              onChange={(e) => update('bpm_max', e.target.value)}
              className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-3 py-2 text-sm text-text placeholder:text-muted focus:border-acid focus:outline-none"
            />
          </div>
        </div>

        {/* Key */}
        <div className="rounded-2xl border border-white/10 bg-panel px-4 py-3">
          <label className="block text-[10px] font-mono uppercase tracking-[0.22em] text-dim mb-2">
            Musical Key
          </label>
          <select
            value={filters.musical_key}
            onChange={(e) => update('musical_key', e.target.value)}
            className="w-full bg-transparent text-sm text-text focus:outline-none cursor-pointer"
          >
            <option value="">All Keys</option>
            {MUSICAL_KEYS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>

        {/* Pending / status */}
        <div className="rounded-2xl border border-white/10 bg-panel px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-dim mb-2">
              Status
            </p>
            <p className="text-sm text-bright">
              {isPending ? 'Updating results…' : 'Filters ready'}
            </p>
          </div>

          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isPending ? 'bg-acid animate-pulse' : 'bg-cyan'
            }`}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-panel px-4 py-4">
        <label className="block text-[10px] font-mono uppercase tracking-[0.22em] text-dim mb-3">
          Track Type
        </label>

        <div className="flex flex-wrap gap-2">
          {TRACK_TYPES.map((type) => {
            const active = filters.track_type === type;

            return (
              <button
                key={type}
                type="button"
                onClick={() => update('track_type', active ? '' : type)}
                className={[
                  'text-[11px] font-mono uppercase tracking-[0.18em] px-3 py-2 rounded-full border transition-all',
                  active
                    ? 'bg-acid/10 border-acid/30 text-acid shadow-[0_0_20px_rgba(200,255,0,0.08)]'
                    : 'border-white/10 text-dim hover:border-white/20 hover:text-text hover:bg-white/[0.03]',
                ].join(' ')}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}