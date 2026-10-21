import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) throw new Error('Missing Supabase env variables');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Content tables (site_links, blog_posts, ...) are not in generated types.
export const db = supabase as any;
