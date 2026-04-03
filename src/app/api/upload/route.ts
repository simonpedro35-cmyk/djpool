import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const maxDuration = 60;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function POST(req: NextRequest) {
  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const admin = createAdminClient();
  const form = await req.formData();

  const title     = form.get('title') as string;
  const artistId  = form.get('artistId') as string;
  const newArtist = form.get('newArtist') as string;
  const genreId   = form.get('genreId') as string;
  const bpm       = form.get('bpm') as string;
  const key       = form.get('key') as string;
  const trackType = form.get('trackType') as string;
  const fullFile  = form.get('fullFile') as File;
  const prevFile  = form.get('previewFile') as File;

  if (!title || !fullFile || !prevFile) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Resolve or create artist
  let resolvedArtistId: string | null = artistId || null;
  if (newArtist) {
    const { data: existing } = await admin
      .from('artists')
      .select('id')
      .ilike('name', newArtist)
      .maybeSingle();

    if (existing) {
      resolvedArtistId = existing.id;
    } else {
      const { data: created, error: artistErr } = await admin
        .from('artists')
        .insert({ name: newArtist })
        .select('id')
        .single();

      if (artistErr) {
        return NextResponse.json({ error: 'Failed to create artist' }, { status: 500 });
      }
      resolvedArtistId = created.id;
    }
  }

  const timestamp = Date.now();
  const base = slugify(title);

  // Upload full track (private bucket)
  const fullExt  = fullFile.name.split('.').pop() ?? 'mp3';
  const fullPath = `full/${timestamp}-${base}.${fullExt}`;
  const fullBuf  = Buffer.from(await fullFile.arrayBuffer());

  const { error: fullErr } = await admin.storage
    .from('tracks')
    .upload(fullPath, fullBuf, {
      contentType: fullFile.type || 'audio/mpeg',
      upsert: false,
    });

  if (fullErr) {
    console.error('Full upload error:', fullErr);
    return NextResponse.json({ error: `Full track upload failed: ${fullErr.message}` }, { status: 500 });
  }

  // Upload preview (public bucket)
  const prevPath = `previews/${timestamp}-${base}-preview.mp3`;
  const prevBuf  = Buffer.from(await prevFile.arrayBuffer());

  const { error: prevErr } = await admin.storage
    .from('previews')
    .upload(prevPath, prevBuf, {
      contentType: 'audio/mpeg',
      upsert: false,
    });

  if (prevErr) {
    // Clean up full track if preview fails
    await admin.storage.from('tracks').remove([fullPath]);
    console.error('Preview upload error:', prevErr);
    return NextResponse.json({ error: `Preview upload failed: ${prevErr.message}` }, { status: 500 });
  }

  // Get public URL for preview
  const { data: { publicUrl } } = admin.storage
    .from('previews')
    .getPublicUrl(prevPath);

  // Insert track record
  const { data: track, error: trackErr } = await admin
    .from('tracks')
    .insert({
      title,
      artist_id:   resolvedArtistId,
      genre_id:    genreId || null,
      bpm:         bpm ? parseInt(bpm) : null,
      musical_key: key || null,
      track_type:  trackType,
      file_url:    fullPath,    // private path — used to generate signed URL on download
      preview_url: publicUrl,   // public CDN URL
    })
    .select('id')
    .single();

  if (trackErr) {
    // Roll back storage uploads
    await admin.storage.from('tracks').remove([fullPath]);
    await admin.storage.from('previews').remove([prevPath]);
    console.error('Track insert error:', trackErr);
    return NextResponse.json({ error: 'Failed to save track' }, { status: 500 });
  }

  return NextResponse.json({ success: true, trackId: track.id });
}
