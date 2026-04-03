'use client';

import { useState, useRef } from 'react';
import { Upload, CheckCircle, AlertCircle, Plus, Loader2 } from 'lucide-react';
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
      <label className="block text-xs font-mono text-dim uppercase tracking-widest mb-2">
        {label}
      </label>
      <div
        onClick={() => ref.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files[0];
          if (f) onChange(f);
        }}
        className={`
          border-2 border-dashed rounded-sm px-6 py-6 text-center cursor-pointer transition-colors
          ${dragging ? 'border-acid bg-acid/5' : 'border-border hover:border-muted'}
          ${file ? 'border-acid/50 bg-acid/5' : ''}
        `}
      >
        <input
          ref={ref}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onChange(f); }}
        />
        {file ? (
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 text-acid" />
            <span className="text-sm text-acid font-medium truncate max-w-xs">{file.name}</span>
            <span className="text-xs text-dim">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
          </div>
        ) : (
          <>
            <Upload className="w-6 h-6 text-dim mx-auto mb-2" />
            <p className="text-sm text-dim">Drop file here or <span className="text-acid">browse</span></p>
            <p className="text-xs text-muted mt-1">{hint}</p>
          </>
        )}
      </div>
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
  const [state, setState] = useState<UploadState>({ status: 'idle', message: '', progress: 0 });

  const reset = () => {
    setTitle(''); setArtistId(''); setNewArtist('');
    setShowNewArtist(false); setGenreId(''); setBpm('');
    setKey(''); setTrackType('extended');
    setFullFile(null); setPreviewFile(null);
    setState({ status: 'idle', message: '', progress: 0 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullFile || !previewFile) {
      setState({ status: 'error', message: 'Please select both audio files.', progress: 0 });
      return;
    }
    if (!title.trim()) {
      setState({ status: 'error', message: 'Please enter a track title.', progress: 0 });
      return;
    }

    setState({ status: 'uploading', message: 'Uploading files…', progress: 10 });

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
      setState(s => ({ ...s, progress: 30, message: 'Uploading full track…' }));
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      setState(s => ({ ...s, progress: 80, message: 'Saving to database…' }));
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setState({ status: 'success', message: 'Track uploaded successfully!', progress: 100 });
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
      <div className="bg-surface border border-border rounded-sm p-10 text-center animate-fade-in">
        <CheckCircle className="w-12 h-12 text-acid mx-auto mb-4" />
        <h2 className="font-display text-xl font-bold text-bright mb-2">Track Uploaded</h2>
        <p className="text-dim text-sm mb-6">{state.message}</p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={reset} className="px-6 py-2.5 bg-acid text-void font-display font-bold text-sm rounded-sm hover:bg-acid/90 transition-colors">
            Upload Another
          </button>
          <a href="/dashboard" className="px-6 py-2.5 border border-border text-dim font-display text-sm rounded-sm hover:border-muted hover:text-text transition-colors">
            View Library
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-sm p-6 space-y-6">

      {/* Title */}
      <div>
        <label className="block text-xs font-mono text-dim uppercase tracking-widest mb-2">
          Track Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="e.g. Running (Extended Mix)"
          className="w-full bg-panel border border-border rounded-sm px-4 py-3 text-text text-sm focus:border-acid focus:outline-none transition-colors placeholder:text-muted"
        />
      </div>

      {/* Artist */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-mono text-dim uppercase tracking-widest">Artist</label>
          <button
            type="button"
            onClick={() => setShowNewArtist(!showNewArtist)}
            className="flex items-center gap-1 text-xs text-acid hover:text-acid/80 transition-colors"
          >
            <Plus className="w-3 h-3" />
            {showNewArtist ? 'Select existing' : 'New artist'}
          </button>
        </div>
        {showNewArtist ? (
          <input
            type="text"
            value={newArtist}
            onChange={(e) => setNewArtist(e.target.value)}
            placeholder="Artist name"
            className="w-full bg-panel border border-border rounded-sm px-4 py-3 text-text text-sm focus:border-acid focus:outline-none transition-colors placeholder:text-muted"
          />
        ) : (
          <select
            value={artistId}
            onChange={(e) => setArtistId(e.target.value)}
            className="w-full bg-panel border border-border rounded-sm px-4 py-3 text-text text-sm focus:border-acid focus:outline-none appearance-none"
          >
            <option value="">— Select artist —</option>
            {artists.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Genre */}
      <div>
        <label className="block text-xs font-mono text-dim uppercase tracking-widest mb-2">Genre</label>
        <select
          value={genreId}
          onChange={(e) => setGenreId(e.target.value)}
          className="w-full bg-panel border border-border rounded-sm px-4 py-3 text-text text-sm focus:border-acid focus:outline-none appearance-none"
        >
          <option value="">— Select genre —</option>
          {genres.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>

      {/* BPM + Key + Type */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-mono text-dim uppercase tracking-widest mb-2">BPM</label>
          <input
            type="number"
            value={bpm}
            onChange={(e) => setBpm(e.target.value)}
            placeholder="128"
            min={60}
            max={220}
            className="w-full bg-panel border border-border rounded-sm px-4 py-3 text-text text-sm focus:border-acid focus:outline-none transition-colors placeholder:text-muted"
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-dim uppercase tracking-widest mb-2">Key</label>
          <select
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full bg-panel border border-border rounded-sm px-4 py-3 text-text text-sm focus:border-acid focus:outline-none appearance-none"
          >
            <option value="">—</option>
            {MUSICAL_KEYS.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-mono text-dim uppercase tracking-widest mb-2">Type *</label>
          <select
            value={trackType}
            onChange={(e) => setTrackType(e.target.value)}
            required
            className="w-full bg-panel border border-border rounded-sm px-4 py-3 text-text text-sm focus:border-acid focus:outline-none appearance-none"
          >
            {TRACK_TYPES.map((t) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Files */}
      <div className="space-y-4">
        <FileDropZone
          label="Full Track (WAV / 320k MP3) *"
          accept=".wav,.mp3,audio/wav,audio/mpeg"
          hint="WAV or 320kbps MP3 — full quality"
          file={fullFile}
          onChange={setFullFile}
        />
        <FileDropZone
          label="Preview File (96kbps MP3) *"
          accept=".mp3,audio/mpeg"
          hint="30–60 second preview at 96kbps — publicly streamable"
          file={previewFile}
          onChange={setPreviewFile}
        />
      </div>

      {/* Error */}
      {state.status === 'error' && (
        <div className="flex items-center gap-2 bg-warn/10 border border-warn/30 text-warn text-xs px-4 py-3 rounded-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {state.message}
        </div>
      )}

      {/* Progress */}
      {state.status === 'uploading' && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-dim">{state.message}</span>
            <span className="text-xs font-mono text-acid">{state.progress}%</span>
          </div>
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-acid transition-all duration-500"
              style={{ width: `${state.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={state.status === 'uploading'}
        className="w-full flex items-center justify-center gap-2 bg-acid text-void font-display font-bold text-sm tracking-wider py-3.5 rounded-sm hover:bg-acid/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
    </form>
  );
}
