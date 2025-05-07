import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createRedisClient } from '@/utils/redis'
import { Sqids } from 'sqids'

const sqids = new Sqids({
  minLength: 6,
  alphabet: 'abcdefghijklmnopqrstuvwxyz1234567890'
})

export async function POST(req: Request) {
  const supabase = createClient()
  const redis = createRedisClient()
  const formData = await req.formData()
  const file = formData.get('file') as File
  
  // Upload to Supabase
  const { data, error } = await supabase.storage
    .from('files')
    .upload(`uploads/${crypto.randomUUID()}`, file)

  if (error) return NextResponse.json({ error }, { status: 500 })

  // Generate short ID
  const shortId = sqids.encode([Date.now()])
  const expiresAt = Date.now() + 3_600_000 // 1 hour
  const maxDownloads = 3

  // Store in Redis
  await redis.set(`file:${shortId}`, JSON.stringify({
    path: data.path,
    expiresAt,
    downloadsRemaining: maxDownloads
  }), { EX: 3_600 }) // 1 hour TTL

  return NextResponse.json({ 
    shortId,
    downloadUrl: `/dl/${shortId}` 
  })
}
