import { supabase } from './supabase';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
const MAX_BYTES = 5 * 1024 * 1024;

/** Uploads an image to the public `site-media` bucket and returns its public URL. */
export async function uploadImage(file: File, folder: string): Promise<string> {
  if (!ALLOWED.includes(file.type)) throw new Error('Only JPG, PNG, WebP or SVG images are allowed.');
  if (file.size > MAX_BYTES) throw new Error('Image must be 5 MB or smaller.');
  const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'png';
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from('site-media').upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  return supabase.storage.from('site-media').getPublicUrl(path).data.publicUrl;
}
