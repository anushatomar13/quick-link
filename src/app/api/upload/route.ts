import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createRedisClient } from '@/utils/redis'
import Sqids from 'sqids'

const sqids = new Sqids({
  minLength: 6,
  alphabet: 'abcdefghijklmnopqrstuvwxyz1234567890'
})

export async function POST(req: Request) {
  const supabase = createClient()
  const redis = await createRedisClient()
  const formData = await req.formData()
  const file = formData.get('file') as File

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  // Upload to Supabase
  const { data, error } = await supabase.storage
    .from('files')
    .upload(`uploads/${crypto.randomUUID()}`, file)

  if (error) {
    console.error('Supabase upload error:', error)
    return NextResponse.json({ error: 'File upload failed' }, { status: 500 })
  }

  // Generate short ID
  const shortId = sqids.encode([Date.now()])
  const expiresAt = Date.now() + 3_600_000 // 1 hour
  const maxDownloads = 3

  // Store in Redis
  try {
    await redis.set(`file:${shortId}`, JSON.stringify({
      path: data.path,
      expiresAt,
      downloadsRemaining: maxDownloads
    }), { EX: 3_600 }) // 1 hour TTL
  } catch (err) {
    console.error('Redis error:', err)
    await supabase.storage.from('files').remove([data.path])
    return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 })
  }

  return NextResponse.json({ 
    shortId,
    downloadUrl: `/dl/${shortId}` 
  })
}
