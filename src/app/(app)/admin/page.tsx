import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import UploadForm from './UploadForm';
import type { Artist, Genre } from '@/types';
import { ShieldCheck, UploadCloud, Disc3 } from 'lucide-react';

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') redirect('/dashboard');

  const [{ data: artists }, { data: genres }] = await Promise.all([
    supabase.from('artists').select('*').order('name'),
    supabase.from('genres').select('*').order('name'),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 animate-fade-in">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-panel to-[#0b0f14] p-8 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-acid/10 border border-acid/20 flex items-center justify-center">
              <UploadCloud className="w-6 h-6 text-acid" />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-acid font-mono mb-3">
                <ShieldCheck className="w-4 h-4" />
                Admin Panel
              </div>

              <h1 className="font-display text-3xl md:text-4xl font-bold text-bright leading-tight">
                Upload new music
              </h1>

              <p className="text-dim text-sm md:text-base mt-3 max-w-2xl">
                Add new tracks to your record pool, organize artists and genres,
                and publish previews ready for DJs to stream and download.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/5 bg-[#0d1218] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.25)]">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-center">
              <Disc3 className="w-5 h-5 text-cyan" />
            </div>
            <div>
              <p className="text-sm font-semibold text-bright">Upload guidelines</p>
              <p className="text-xs text-dim">Keep your library clean and consistent</p>
            </div>
          </div>

          <div className="space-y-4 text-sm text-dim">
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
              <p className="text-bright font-medium mb-1">Full track</p>
              <p>Upload WAV or high-quality MP3 for private downloads.</p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
              <p className="text-bright font-medium mb-1">Preview clip</p>
              <p>Use a short low-bitrate MP3 preview for public streaming.</p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
              <p className="text-bright font-medium mb-1">Metadata quality</p>
              <p>Set title, artist, genre, BPM, key and type carefully for clean discovery.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <UploadForm
          artists={(artists ?? []) as Artist[]}
          genres={(genres ?? []) as Genre[]}
        />
      </div>
    </div>
  );
}
