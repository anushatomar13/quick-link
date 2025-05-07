import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/utils/supabase';
import { createRedisClient } from '@/utils/redis';
import Sqids from 'sqids';

const sqids = new Sqids({
  minLength: 6,
  alphabet: 'abcdefghijklmnopqrstuvwxyz1234567890'
});

export async function POST(req: Request) {
  const supabase = createSupabaseClient();
  const redis = await createRedisClient();
  const formData = await req.formData();

  const file = formData.get('file') as File;
  const validityHours = Number(formData.get('validityHours') || 1);
  const maxDownloads = Number(formData.get('maxDownloads') || 3);

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(`uploads/${crypto.randomUUID()}`, file);

  if (error) {
    return NextResponse.json({ error: 'File upload failed' }, { status: 500 });
  }

  const shortId = sqids.encode([Date.now()]);
  const expiresAt = Date.now() + (validityHours * 3_600_000);

  try {
    await redis.set(`file:${shortId}`, JSON.stringify({
      path: data.path,
      expiresAt,
      downloadsRemaining: maxDownloads,
      originalFilename: file.name,
      maxDownloads
    }), { 
      EX: validityHours * 3600
    });
  } catch (err) {
    await supabase.storage.from('uploads').remove([data.path]);
    return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 });
  }

  return NextResponse.json({
    shortId,
    downloadUrl: `/dl/${shortId}`
  });
}
