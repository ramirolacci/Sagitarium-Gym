import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Use a valid URL format even if it's a placeholder to prevent the SDK from crashing the app
const supabaseUrl = (rawUrl && rawUrl.startsWith('https://')) ? rawUrl : 'https://placeholder.supabase.co'
const supabaseAnonKey = rawKey || 'placeholder-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
