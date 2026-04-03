import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import UploadForm from './UploadForm';
import type { Artist, Genre } from '@/types';

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();

  if (profile?.role !== 'admin') redirect('/dashboard');

  const [{ data: artists }, { data: genres }] = await Promise.all([
    supabase.from('artists').select('*').order('name'),
    supabase.from('genres').select('*').order('name'),
  ]);

  return (
    <div className="p-5 md:p-8 animate-fade-in max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-bright">Upload Track</h1>
        <p className="text-dim text-sm mt-1">
          Add a new track to the DJ Pool library.
        </p>
      </div>

      <UploadForm
        artists={(artists ?? []) as Artist[]}
        genres={(genres ?? []) as Genre[]}
      />
    </div>
  );
}
