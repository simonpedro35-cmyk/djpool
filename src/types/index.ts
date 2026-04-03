export type Role = 'admin' | 'user';

export interface Profile {
  id: string;
  email: string;
  role: Role;
  created_at: string;
}

export interface Artist {
  id: string;
  name: string;
  created_at: string;
}

export interface Genre {
  id: string;
  name: string;
  created_at: string;
}

export type TrackType = 'extended' | 'edit' | 'remix' | 'original';

export interface Track {
  id: string;
  title: string;
  artist_id: string | null;
  genre_id: string | null;
  bpm: number | null;
  musical_key: string | null;
  track_type: TrackType;
  file_url: string;
  preview_url: string;
  created_at: string;
}

export interface TrackView {
  id: string;
  title: string;
  bpm: number | null;
  musical_key: string | null;
  track_type: TrackType;
  preview_url: string;
  file_url: string;
  created_at: string;
  artist_id: string | null;
  artist_name: string | null;
  genre_id: string | null;
  genre_name: string | null;
  download_count: number;
}

export interface Download {
  id: string;
  user_id: string;
  track_id: string;
  created_at: string;
}

export interface FilterState {
  search: string;
  genre_id: string;
  bpm_min: string;
  bpm_max: string;
  musical_key: string;
  track_type: string;
  sort_by: 'created_at' | 'bpm' | 'download_count';
  sort_dir: 'asc' | 'desc';
}

export const MUSICAL_KEYS = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F',
  'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
  'Cm', 'C#m', 'Dm', 'D#m', 'Ebm', 'Em', 'Fm',
  'F#m', 'Gbm', 'Gm', 'G#m', 'Abm', 'Am', 'A#m', 'Bbm', 'Bm',
];

export const TRACK_TYPES: TrackType[] = ['extended', 'original', 'edit', 'remix'];
