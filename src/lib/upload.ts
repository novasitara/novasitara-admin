import { api } from './api';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
const MAX_BYTES = 5 * 1024 * 1024;

/** Uploads an image to the server and returns its public URL (e.g. /uploads/123.png). */
export async function uploadImage(file: File): Promise<string> {
  if (!ALLOWED.includes(file.type)) throw new Error('Only JPG, PNG, WebP or SVG images are allowed.');
  if (file.size > MAX_BYTES) throw new Error('Image must be 5 MB or smaller.');
  const body = new FormData();
  body.append('file', file);
  const { url } = await api<{ url: string }>('/admin/uploads', { body });
  return url;
}
