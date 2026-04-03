import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ trackId: string }> }
) {
  const { trackId } = await params;

  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get track file path
  const { data: track, error: trackErr } = await supabase
    .from('tracks')
    .select('id, file_url, title')
    .eq('id', trackId)
    .single();

  if (trackErr || !track) {
    return NextResponse.json({ error: 'Track not found' }, { status: 404 });
  }

  const admin = createAdminClient();

  // Generate signed URL (valid 60 seconds)
  const { data: signed, error: signErr } = await admin.storage
    .from('tracks')
    .createSignedUrl(track.file_url, 60, {
      download: `${track.title}.mp3`,
    });

  if (signErr || !signed) {
    console.error('Signed URL error:', signErr);
    return NextResponse.json({ error: 'Could not generate download link' }, { status: 500 });
  }

  // Record download (fire and forget — don't block response)
  admin
    .from('downloads')
    .insert({ user_id: user.id, track_id: trackId })
    .then(({ error }) => {
      if (error) console.error('Download log error:', error);
    });

  return NextResponse.json({ url: signed.signedUrl });
}
