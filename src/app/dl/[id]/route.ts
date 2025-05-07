import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/utils/supabase';
import { createRedisClient } from '@/utils/redis';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseClient();
    const redis = await createRedisClient();
    const { id } = params;
    
    if (!id) return NextResponse.json({ error: 'Invalid link' }, { status: 400 });
    
    const metadata = await redis.get(`file:${id}`);
    if (!metadata) return NextResponse.json({ error: 'Link expired' }, { status: 410 });
    
    const { path, expiresAt, downloadsRemaining, originalFilename, maxDownloads } = JSON.parse(metadata);
    
    if (Date.now() > expiresAt) {
      await redis.del(`file:${id}`);
      return NextResponse.json({ error: 'Link expired' }, { status: 410 });
    }
    
    if (downloadsRemaining <= 0) {
      await redis.del(`file:${id}`);
      return NextResponse.json({ error: 'Download limit reached' }, { status: 410 });
    }
    
    const newCount = downloadsRemaining - 1;
    await redis.set(`file:${id}`, JSON.stringify({
      path,
      expiresAt,
      originalFilename,
      downloadsRemaining: newCount,
      maxDownloads 
    }));
    
    const { data } = await supabase.storage
      .from('uploads')
      .createSignedUrl(path, 60);

    if (!data?.signedUrl) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    const response = NextResponse.redirect(data.signedUrl);
    if (originalFilename) {
      response.headers.set(
        'Content-Disposition', 
        `attachment; filename="${encodeURIComponent(originalFilename)}"`
      );
    }
    
    return response;
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
