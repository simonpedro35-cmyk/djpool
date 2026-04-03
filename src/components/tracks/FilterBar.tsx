'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
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
  const [, startTransition] = useTransition();

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reset page on filter change
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

  const hasFilters = Object.entries(filters).some(([k, v]) =>
    !['sort_by', 'sort_dir'].includes(k) && v !== ''
  );

  return (
    <div className="space-y-3">
      {/* Search + Sort row */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dim pointer-events-none" />
          <input
            type="text"
            placeholder="Search title or artist…"
            defaultValue={filters.search}
            onChange={(e) => update('search', e.target.value)}
            className="w-full bg-panel border border-border rounded-sm pl-9 pr-4 py-2.5 text-sm text-text placeholder:text-muted focus:border-acid focus:outline-none transition-colors"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-dim shrink-0" />
          <select
            value={`${filters.sort_by}:${filters.sort_dir}`}
            onChange={(e) => {
              const [by, dir] = e.target.value.split(':');
              update('sort_by', by);
              update('sort_dir', dir);
            }}
            className="bg-panel border border-border rounded-sm px-3 py-2.5 text-sm text-text focus:border-acid focus:outline-none appearance-none cursor-pointer pr-8"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234A5568' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
          >
            <option value="created_at:desc">Newest First</option>
            <option value="created_at:asc">Oldest First</option>
            <option value="bpm:asc">BPM ↑</option>
            <option value="bpm:desc">BPM ↓</option>
            <option value="download_count:desc">Most Downloaded</option>
          </select>
        </div>

        {hasFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 text-xs text-dim hover:text-warn transition-colors px-2 py-2"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Filter chips row */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Genre */}
        <select
          value={filters.genre_id}
          onChange={(e) => update('genre_id', e.target.value)}
          className="bg-panel border border-border rounded-sm px-3 py-1.5 text-xs text-text focus:border-acid focus:outline-none appearance-none cursor-pointer pr-7"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%234A5568' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
        >
          <option value="">All Genres</option>
          {genres.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>

        {/* BPM min */}
        <input
          type="number"
          placeholder="BPM min"
          defaultValue={filters.bpm_min}
          onChange={(e) => update('bpm_min', e.target.value)}
          className="w-24 bg-panel border border-border rounded-sm px-3 py-1.5 text-xs text-text placeholder:text-muted focus:border-acid focus:outline-none"
        />

        <span className="text-dim text-xs">–</span>

        {/* BPM max */}
        <input
          type="number"
          placeholder="BPM max"
          defaultValue={filters.bpm_max}
          onChange={(e) => update('bpm_max', e.target.value)}
          className="w-24 bg-panel border border-border rounded-sm px-3 py-1.5 text-xs text-text placeholder:text-muted focus:border-acid focus:outline-none"
        />

        {/* Key */}
        <select
          value={filters.musical_key}
          onChange={(e) => update('musical_key', e.target.value)}
          className="bg-panel border border-border rounded-sm px-3 py-1.5 text-xs text-text focus:border-acid focus:outline-none appearance-none cursor-pointer pr-7"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%234A5568' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
        >
          <option value="">All Keys</option>
          {MUSICAL_KEYS.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>

        {/* Type */}
        <div className="flex items-center gap-1.5">
          {TRACK_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => update('track_type', filters.track_type === type ? '' : type)}
              className={`
                text-[10px] font-mono uppercase tracking-wider border px-2 py-1 rounded-sm transition-colors
                ${filters.track_type === type
                  ? 'bg-acid/10 border-acid/50 text-acid'
                  : 'border-border text-dim hover:border-muted hover:text-text'
                }
              `}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
