'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Play, Download, Loader2 } from 'lucide-react';
import { usePlayer } from '@/components/player/PlayerContext';
import type { TrackView } from '@/types';

interface TrackRowProps {
  track: TrackView;
  index: number;
}

const TYPE_COLORS: Record<string, string> = {
  extended: 'text-acid border-acid/25 bg-acid/8',
  original: 'text-cyan border-cyan/25 bg-cyan/8',
  remix: 'text-magenta border-magenta/25 bg-magenta/8',
  edit: 'text-warn border-warn/25 bg-warn/8',
};

export function TrackRow({ track, index }: TrackRowProps) {
  const { toggle, currentTrack, isPlaying } = usePlayer();
  const [downloading, setDownloading] = useState(false);

  const isActive = currentTrack?.id === track.id;
  const isCurrentPlaying = isActive && isPlaying;

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloading(true);

    try {
      const res = await fetch(`/api/download/${track.id}`);
      if (!res.ok) throw new Error('Download failed');

      const { url } = await res.json();
      const a = document.createElement('a');
      a.href = url;
      a.download = `${track.title}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const typeClass = TYPE_COLORS[track.track_type] ?? 'text-dim border-border bg-panel/60';

  return (
    <tr
      onClick={() => toggle(track)}
      className={[
        'group border-b border-border transition-all cursor-pointer',
        isActive ? 'bg-acid/[0.06]' : 'hover:bg-panel/70',
      ].join(' ')}
    >
      <td className="w-14 px-4 py-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggle(track);
          }}
          className="w-7 h-7 rounded-full flex items-center justify-center bg-panel border border-border hover:border-acid/20 hover:bg-acid/10 transition"
          aria-label={isCurrentPlaying ? 'Pause' : 'Play'}
        >
          {isCurrentPlaying ? (
            <div className="flex items-end gap-[2px] h-4">
              {[40, 70, 100, 60].map((h, i) => (
                <div
                  key={i}
                  className="eq-bar"
                  style={{ height: `${h}%`, animationDelay: `${i * 0.12}s`, width: '2px' }}
                />
              ))}
            </div>
          ) : (
            <Play className="w-3.5 h-3.5 text-acid fill-acid ml-[1px]" />
          )}
        </button>
      </td>

      <td className="py-4 pr-4 min-w-[220px]">
        <div className="flex flex-col">
          <p
            className={`text-sm font-semibold truncate ${
              isActive ? 'text-acid' : 'text-bright'
            }`}
          >
            {track.title}
          </p>
          <p className="text-[11px] text-muted mt-1">Track #{index + 1}</p>
        </div>
      </td>

      <td className="py-4 pr-4 hidden sm:table-cell">
        {track.artist_name ? (
          <Link
            href={`/artist/${track.artist_id}`}
            className="text-sm text-dim hover:text-acid transition-colors truncate block"
            onClick={(e) => e.stopPropagation()}
          >
            {track.artist_name}
          </Link>
        ) : (
          <span className="text-sm text-muted">—</span>
        )}
      </td>

      <td className="py-4 pr-4 hidden md:table-cell">
        {track.genre_name ? (
          <Link
            href={`/genre/${track.genre_id}`}
            className="text-xs text-dim hover:text-acid transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {track.genre_name}
          </Link>
        ) : (
          <span className="text-xs text-muted">—</span>
        )}
      </td>

      <td className="py-4 pr-4 hidden lg:table-cell">
        <span className="text-xs font-mono text-dim">{track.bpm ?? '—'}</span>
      </td>

      <td className="py-4 pr-4 hidden lg:table-cell">
        <span className="text-xs font-mono text-cyan">{track.musical_key ?? '—'}</span>
      </td>

      <td className="py-4 pr-4 hidden sm:table-cell">
        <span
          className={`text-[10px] font-mono uppercase tracking-[0.18em] border px-2 py-1 rounded-full ${typeClass}`}
        >
          {track.track_type}
        </span>
      </td>

      <td className="py-4 pr-4 hidden xl:table-cell">
        <span className="text-xs font-mono text-muted">{track.download_count}</span>
      </td>

      <td className="py-4 px-4">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center gap-2 text-xs px-3 py-2 rounded-full bg-panel border border-border text-dim hover:text-acid hover:border-acid/20 hover:bg-acid/10 transition disabled:opacity-40 disabled:cursor-not-allowed"
          title="Download full track"
        >
          {downloading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          <span className="hidden md:inline">
            {downloading ? 'Loading…' : 'Download'}
          </span>
        </button>
      </td>
    </tr>
  );
}

interface TrackTableProps {
  tracks: TrackView[];
}

export default function TrackTable({ tracks }: TrackTableProps) {
  if (tracks.length === 0) {
    return (
      <div className="text-center py-24 text-dim border border-border rounded-3xl bg-surface">
        <p className="text-5xl mb-4">🎧</p>
        <p className="font-display text-xl text-bright">No tracks found</p>
        <p className="text-sm mt-2">Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border bg-surface overflow-hidden shadow-[0_10px_80px_rgba(0,0,0,0.12)]">
      <div className="px-5 py-4 border-b border-border bg-panel/60">
        <div className="grid grid-cols-[56px_minmax(220px,1fr)_180px_140px_80px_80px_110px_70px_120px] gap-0 text-[10px] font-mono uppercase tracking-[0.25em] text-muted">
          <div>#</div>
          <div>Title</div>
          <div className="hidden sm:block">Artist</div>
          <div className="hidden md:block">Genre</div>
          <div className="hidden lg:block">BPM</div>
          <div className="hidden lg:block">Key</div>
          <div className="hidden sm:block">Type</div>
          <div className="hidden xl:block">DL</div>
          <div></div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <tbody>
            {tracks.map((track, i) => (
              <TrackRow key={track.id} track={track} index={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}