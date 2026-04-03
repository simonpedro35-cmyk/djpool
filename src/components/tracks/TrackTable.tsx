'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Play, Pause, Download, Loader2 } from 'lucide-react';
import { usePlayer } from '@/components/player/PlayerContext';
import type { TrackView } from '@/types';

interface TrackRowProps {
  track: TrackView;
  index: number;
}

const TYPE_COLORS: Record<string, string> = {
  extended: 'text-acid   border-acid/30   bg-acid/5',
  original: 'text-cyan   border-cyan/30   bg-cyan/5',
  remix:    'text-magenta border-magenta/30 bg-magenta/5',
  edit:     'text-warn   border-warn/30   bg-warn/5',
};

export function TrackRow({ track, index }: TrackRowProps) {
  const { toggle, currentTrack, isPlaying } = usePlayer();
  const [downloading, setDownloading] = useState(false);

  const isActive = currentTrack?.id === track.id;
  const isCurrentPlaying = isActive && isPlaying;

  const handleDownload = async () => {
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

  const typeClass = TYPE_COLORS[track.track_type] ?? 'text-dim border-border';

  return (
    <tr
      className={`
        group border-b border-border/50 transition-colors hover:bg-panel/60 cursor-pointer
        ${isActive ? 'bg-acid/5 border-acid/20' : ''}
      `}
    >
      {/* Index / Play */}
      <td className="w-12 px-4 py-3">
        <button
          onClick={() => toggle(track)}
          className="w-6 h-6 flex items-center justify-center"
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
            <>
              <span className="text-dim text-xs font-mono group-hover:hidden">{index + 1}</span>
              <Play className="w-3.5 h-3.5 text-acid fill-acid hidden group-hover:block" />
            </>
          )}
        </button>
      </td>

      {/* Title */}
      <td className="py-3 pr-4 min-w-0">
        <p className={`text-sm font-medium truncate ${isActive ? 'text-acid' : 'text-bright'}`}>
          {track.title}
        </p>
      </td>

      {/* Artist */}
      <td className="py-3 pr-4 hidden sm:table-cell">
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

      {/* Genre */}
      <td className="py-3 pr-4 hidden md:table-cell">
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

      {/* BPM */}
      <td className="py-3 pr-4 hidden lg:table-cell">
        <span className="text-xs font-mono text-dim">
          {track.bpm ?? '—'}
        </span>
      </td>

      {/* Key */}
      <td className="py-3 pr-4 hidden lg:table-cell">
        <span className="text-xs font-mono text-cyan">
          {track.musical_key ?? '—'}
        </span>
      </td>

      {/* Type */}
      <td className="py-3 pr-4 hidden sm:table-cell">
        <span className={`text-[10px] font-mono uppercase tracking-wider border px-1.5 py-0.5 rounded-sm ${typeClass}`}>
          {track.track_type}
        </span>
      </td>

      {/* Downloads */}
      <td className="py-3 pr-4 hidden xl:table-cell">
        <span className="text-xs font-mono text-muted">{track.download_count}</span>
      </td>

      {/* Actions */}
      <td className="py-3 px-4">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-1.5 text-xs text-dim hover:text-acid transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title="Download full track"
        >
          {downloading
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <Download className="w-3.5 h-3.5" />
          }
          <span className="hidden md:inline">{downloading ? 'Loading…' : 'DL'}</span>
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
      <div className="text-center py-20 text-dim">
        <p className="text-5xl mb-4">🎧</p>
        <p className="font-display text-lg">No tracks found</p>
        <p className="text-sm mt-2">Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="w-12 px-4 pb-3 text-[10px] font-mono text-muted uppercase tracking-widest">#</th>
            <th className="pb-3 pr-4 text-[10px] font-mono text-muted uppercase tracking-widest">Title</th>
            <th className="pb-3 pr-4 text-[10px] font-mono text-muted uppercase tracking-widest hidden sm:table-cell">Artist</th>
            <th className="pb-3 pr-4 text-[10px] font-mono text-muted uppercase tracking-widest hidden md:table-cell">Genre</th>
            <th className="pb-3 pr-4 text-[10px] font-mono text-muted uppercase tracking-widest hidden lg:table-cell">BPM</th>
            <th className="pb-3 pr-4 text-[10px] font-mono text-muted uppercase tracking-widest hidden lg:table-cell">Key</th>
            <th className="pb-3 pr-4 text-[10px] font-mono text-muted uppercase tracking-widest hidden sm:table-cell">Type</th>
            <th className="pb-3 pr-4 text-[10px] font-mono text-muted uppercase tracking-widest hidden xl:table-cell">DL</th>
            <th className="pb-3 px-4 text-[10px] font-mono text-muted uppercase tracking-widest"></th>
          </tr>
        </thead>
        <tbody>
          {tracks.map((track, i) => (
            <TrackRow key={track.id} track={track} index={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
