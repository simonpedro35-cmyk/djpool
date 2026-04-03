'use client';

import { usePlayer } from './PlayerContext';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

function formatTime(secs: number): string {
  if (!secs || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function PlayerBar() {
  const { currentTrack, isPlaying, progress, duration, volume, pause, resume, seek, setVolume } = usePlayer();

  if (!currentTrack) return null;

  const elapsed = progress * duration;

  return (
    <div className="border-t border-border bg-panel/95 backdrop-blur-xl px-4 md:px-6 py-3 animate-slide-in">
      <div className="flex items-center gap-4 max-w-screen-xl mx-auto">

        {/* Track info */}
        <div className="flex items-center gap-3 min-w-0 flex-1 md:flex-none md:w-56">
          {isPlaying && (
            <div className="flex items-end gap-[2px] h-4 shrink-0">
              {[40, 70, 100, 60, 85].map((h, i) => (
                <div
                  key={i}
                  className="eq-bar"
                  style={{ height: `${h}%`, animationDelay: `${i * 0.12}s`, width: '2px' }}
                />
              ))}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-medium text-bright truncate">{currentTrack.title}</p>
            <p className="text-xs text-dim truncate">{currentTrack.artist_name ?? '—'}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex-1 flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-3">
            <button
              onClick={isPlaying ? pause : resume}
              className="w-8 h-8 rounded-full bg-acid flex items-center justify-center hover:bg-acid/90 transition-colors"
            >
              {isPlaying
                ? <Pause className="w-3.5 h-3.5 text-void fill-void" />
                : <Play className="w-3.5 h-3.5 text-void fill-void ml-0.5" />
              }
            </button>
          </div>

          {/* Scrubber */}
          <div className="flex items-center gap-2 w-full max-w-md">
            <span className="text-[10px] text-dim font-mono w-7 text-right shrink-0">
              {formatTime(elapsed)}
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.001}
              value={progress}
              onChange={(e) => seek(parseFloat(e.target.value))}
              className="flex-1"
              style={{
                background: `linear-gradient(to right, #C8FF00 ${progress * 100}%, #2A3342 ${progress * 100}%)`,
              }}
            />
            <span className="text-[10px] text-dim font-mono w-7 shrink-0">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume */}
        <div className="hidden md:flex items-center gap-2 w-28">
          <button onClick={() => setVolume(volume > 0 ? 0 : 0.8)}>
            {volume === 0
              ? <VolumeX className="w-3.5 h-3.5 text-dim" />
              : <Volume2 className="w-3.5 h-3.5 text-dim" />
            }
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="flex-1"
            style={{
              background: `linear-gradient(to right, #C8FF00 ${volume * 100}%, #2A3342 ${volume * 100}%)`,
            }}
          />
        </div>

        {/* Meta tags */}
        <div className="hidden lg:flex items-center gap-2">
          {currentTrack.bpm && (
            <span className="text-[10px] font-mono text-dim border border-border px-1.5 py-0.5 rounded-sm">
              {currentTrack.bpm} BPM
            </span>
          )}
          {currentTrack.musical_key && (
            <span className="text-[10px] font-mono text-cyan border border-cyan/20 px-1.5 py-0.5 rounded-sm">
              {currentTrack.musical_key}
            </span>
          )}
          <span className="text-[10px] font-mono uppercase text-acid-dim border border-acid/20 px-1.5 py-0.5 rounded-sm">
            PREVIEW
          </span>
        </div>
      </div>
    </div>
  );
}
