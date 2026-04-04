'use client';

import { useState, useRef } from 'react';
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  Plus,
  Loader2,
  Music4,
  FileAudio,
  Sparkles,
} from 'lucide-react';
import type { Artist, Genre } from '@/types';
import { MUSICAL_KEYS, TRACK_TYPES } from '@/types';

interface UploadFormProps {
  artists: Artist[];
  genres: Genre[];
}

interface UploadState {
  status: 'idle' | 'uploading' | 'success' | 'error';
  message: string;
  progress: number;
}

function FileDropZone({
  label,
  accept,
  hint,
  file,
  onChange,
}: {
  label: string;
  accept: string;
  hint: string;
  file: File | null;
  onChange: (f: File) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div>
      <label className="block text-[11px] font-mono text-dim uppercase tracking-[0.22em] mb-3">
        {label}
      </label>

      <div
        onClick={() => ref.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files[0];
          if (f) onChange(f);
        }}
        className={[
          'rounded-2xl border-2 border-dashed px-6 py-8 text-center cursor-pointer transition-all',
          dragging
            ? 'border-acid bg-acid/5'
            : 'border-white/10 hover:border-acid/30 hover:bg-white/[0.02]',
          file ? 'border-acid/40 bg-acid/[0.04]' : '',
        ].join(' ')}
      >
        <input
          ref={ref}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onChange(f);
          }}
        />

        {file ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-acid/10 border border-acid/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-acid" />
            </div>

            <div>
              <p className="text-sm font-medium text-bright truncate max-w-xs">
                {file.name}
              </p>
              <p className="text-xs text-dim mt-1">
                {(file.size / 1024 / 1024).toFixed(1)} MB selected
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-panel border border-white/5 flex items-center justify-center">
              <Upload className="w-5 h-5 text-dim" />
            </div>

            <div>
              <p className="text-sm text-bright">
                Drop file here or <span className="text-acid font-medium">browse</span>
              </p>
              <p className="text-xs text-dim mt-1">{hint}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/5 bg-[#0d1218] shadow-[0_20px_80px_rgba(0,0,0,0.25)] overflow-hidden">
      <div className="px-6 py-5 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-bright">{title}</h2>
            {subtitle && <p className="text-xs text-dim mt-1">{subtitle}</p>}
          </div>
        </div>
      </div>

      <div className="p-6">{children}</div>
    </div>
  );
}

export default function UploadForm({ artists, genres }: UploadFormProps) {
  const [title, setTitle] = useState('');
  const [artistId, setArtistId] = useState('');
  const [newArtist, setNewArtist] = useState('');
  const [showNewArtist, setShowNewArtist] = useState(false);
  const [genreId, setGenreId] = useState('');
  const [bpm, setBpm] = useState('');
  const [key, setKey] = useState('');
  const [trackType, setTrackType] = useState<string>('extended');
  const [fullFile, setFullFile] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [state, setState] = useState<UploadState>({
    status: 'idle',
    message: '',
    progress: 0,
  });

  const reset = () => {
    setTitle('');
    setArtistId('');
    setNewArtist('');
    setShowNewArtist(false);
    setGenreId('');
    setBpm('');
    setKey('');
    setTrackType('extended');
    setFullFile(null);
    setPreviewFile(null);
    setState({ status: 'idle', message: '', progress: 0 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullFile || !previewFile) {
      setState({
        status: 'error',
        message: 'Please select both audio files.',
        progress: 0,
      });
      return;
    }

    if (!title.trim()) {
      setState({
        status: 'error',
        message: 'Please enter a track title.',
        progress: 0,
      });
      return;
    }

    const isFullValid =
      fullFile.name.toLowerCase().endsWith('.mp3') ||
      fullFile.name.toLowerCase().endsWith('.wav');

    const isPreviewValid = previewFile.name.toLowerCase().endsWith('.mp3');

    if (!isFullValid) {
      setState({
        status: 'error',
        message: 'Full track must be MP3 or WAV.',
        progress: 0,
      });
      return;
    }

    if (!isPreviewValid) {
      setState({
        status: 'error',
        message: 'Preview file must be MP3.',
        progress: 0,
      });
      return;
    }

    setState({
      status: 'uploading',
      message: 'Preparing upload…',
      progress: 10,
    });

    const form = new FormData();
    form.append('title', title.trim());
    form.append('artistId', showNewArtist ? '' : artistId);
    form.append('newArtist', showNewArtist ? newArtist.trim() : '');
    form.append('genreId', genreId);
    form.append('bpm', bpm);
    form.append('key', key);
    form.append('trackType', trackType);
    form.append('fullFile', fullFile);
    form.append('previewFile', previewFile);

    try {
      setState((s) => ({
        ...s,
        progress: 35,
        message: 'Uploading audio files…',
      }));

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: form,
      });

      const text = await res.text();

      let data: { error?: string } = {};
      try {
        data = JSON.parse(text);
      } catch {
        if (!res.ok) {
          throw new Error(text || 'Upload failed');
        }
      }

      setState((s) => ({
        ...s,
        progress: 80,
        message: 'Saving metadata…',
      }));

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setState({
        status: 'success',
        message: 'Track uploaded successfully!',
        progress: 100,
      });
    } catch (err: unknown) {
      setState({
        status: 'error',
        message: err instanceof Error ? err.message : 'Upload failed',
        progress: 0,
      });
    }
  };

  if (state.status === 'success') {
    return (
      <div className="rounded-3xl border border-white/5 bg-[#0d1218] p-10 text-center animate-fade-in shadow-[0_20px_80px_rgba(0,0,0,0.25)]">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-acid/10 border border-acid/20 flex items-center justify-center mb-5">
          <CheckCircle2 className="w-8 h-8 text-acid" />
        </div>

        <h2 className="font-display text-2xl font-bold text-bright mb-2">
          Track uploaded
        </h2>
        <p className="text-dim text-sm mb-8">{state.message}</p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={reset}
            className="px-6 py-3 rounded-2xl bg-acid text-void font-display font-bold text-sm hover:bg-acid/90 transition-colors"
          >
            Upload another
          </button>

          <a
            href="/dashboard"
            className="px-6 py-3 rounded-2xl border border-white/10 text-dim text-sm hover:text-text hover:border-white/20 transition-colors"
          >
            View library
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <SectionCard
        title="Track details"
        subtitle="Basic information for the library listing"
        icon={<Music4 className="w-5 h-5 text-acid" />}
      >
        <div className="space-y-5">
          <div>
            <label className="block text-[11px] font-mono text-dim uppercase tracking-[0.22em] mb-3">
              Track title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Running (Extended Mix)"
              className="w-full bg-panel border border-white/10 rounded-2xl px-4 py-3 text-text text-sm focus:border-acid focus:outline-none transition-colors placeholder:text-muted"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-[11px] font-mono text-dim uppercase tracking-[0.22em]">
                Artist
              </label>

              <button
                type="button"
                onClick={() => setShowNewArtist(!showNewArtist)}
                className="flex items-center gap-1.5 text-xs text-acid hover:text-acid/80 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                {showNewArtist ? 'Select existing' : 'New artist'}
              </button>
            </div>

            {showNewArtist ? (
              <input
                type="text"
                value={newArtist}
                onChange={(e) => setNewArtist(e.target.value)}
                placeholder="Artist name"
                className="w-full bg-panel border border-white/10 rounded-2xl px-4 py-3 text-text text-sm focus:border-acid focus:outline-none transition-colors placeholder:text-muted"
              />
            ) : (
              <select
                value={artistId}
                onChange={(e) => setArtistId(e.target.value)}
                className="w-full bg-panel border border-white/10 rounded-2xl px-4 py-3 text-text text-sm focus:border-acid focus:outline-none appearance-none"
              >
                <option value="">— Select artist —</option>
                {artists.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-mono text-dim uppercase tracking-[0.22em] mb-3">
              Genre
            </label>
            <select
              value={genreId}
              onChange={(e) => setGenreId(e.target.value)}
              className="w-full bg-panel border border-white/10 rounded-2xl px-4 py-3 text-text text-sm focus:border-acid focus:outline-none appearance-none"
            >
              <option value="">— Select genre —</option>
              {genres.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-[11px] font-mono text-dim uppercase tracking-[0.22em] mb-3">
                BPM
              </label>
              <input
                type="number"
                value={bpm}
                onChange={(e) => setBpm(e.target.value)}
                placeholder="128"
                min={60}
                max={220}
                className="w-full bg-panel border border-white/10 rounded-2xl px-4 py-3 text-text text-sm focus:border-acid focus:outline-none transition-colors placeholder:text-muted"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-dim uppercase tracking-[0.22em] mb-3">
                Key
              </label>
              <select
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full bg-panel border border-white/10 rounded-2xl px-4 py-3 text-text text-sm focus:border-acid focus:outline-none appearance-none"
              >
                <option value="">—</option>
                {MUSICAL_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-dim uppercase tracking-[0.22em] mb-3">
                Type *
              </label>
              <select
                value={trackType}
                onChange={(e) => setTrackType(e.target.value)}
                required
                className="w-full bg-panel border border-white/10 rounded-2xl px-4 py-3 text-text text-sm focus:border-acid focus:outline-none appearance-none"
              >
                {TRACK_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Audio files"
        subtitle="Upload the private full track and public preview"
        icon={<FileAudio className="w-5 h-5 text-cyan" />}
      >
        <div className="space-y-5">
          <FileDropZone
            label="Full track (WAV / MP3) *"
            accept=".wav,.mp3,audio/wav,audio/mpeg"
            hint="WAV or high-quality MP3 for private download"
            file={fullFile}
            onChange={setFullFile}
          />

          <FileDropZone
            label="Preview file (MP3) *"
            accept=".mp3,audio/mpeg"
            hint="30–60 second MP3 preview for streaming"
            file={previewFile}
            onChange={setPreviewFile}
          />
        </div>
      </SectionCard>

      {state.status === 'error' && (
        <div className="flex items-center gap-3 rounded-2xl bg-warn/10 border border-warn/20 text-warn text-sm px-4 py-4">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}

      {state.status === 'uploading' && (
        <div className="rounded-2xl border border-acid/15 bg-acid/[0.04] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-dim">{state.message}</span>
            <span className="text-xs font-mono text-acid">{state.progress}%</span>
          </div>

          <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
            <div
              className="h-full bg-acid transition-all duration-500"
              style={{ width: `${state.progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-xs text-dim">
          <Sparkles className="w-4 h-4 text-acid" />
          High-quality metadata makes discovery better.
        </div>

        <button
          type="submit"
          disabled={state.status === 'uploading'}
          className="inline-flex items-center justify-center gap-2 bg-acid text-void font-display font-bold text-sm tracking-wider px-6 py-3 rounded-2xl hover:bg-acid/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {state.status === 'uploading' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              UPLOADING…
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              UPLOAD TRACK
            </>
          )}
        </button>
      </div>
    </form>
  );
}