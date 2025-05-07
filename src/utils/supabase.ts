// utils/supabase.ts
import { createClient as createSupabaseCoreClient } from "@supabase/supabase-js"

export const createSupabaseClient = () => 
  createSupabaseCoreClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
