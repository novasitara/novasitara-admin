import React, { useEffect, useState } from 'react';
import { api, attempt } from '../lib/api';
import { uploadImage } from '../lib/upload';
import { Button } from '../components/Button';

const SLOTS = [
  { name: 'hero', label: 'Home page hero image', note: 'Main illustration at the top of the home page.' },
  { name: 'about', label: 'Home page About image', note: 'Image in the About section of the home page.' },
  { name: 'vistex-feature', label: 'Vistex feature image', note: 'Image in the Vistex section of the home page.' },
];

export const Images: React.FC = () => {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    api<Record<string, any>>('/admin/content')
      .then(content => {
        const next: Record<string, string> = {};
        Object.entries(content).forEach(([key, value]) => { if (key.startsWith('image.')) next[key.slice(6)] = value?.url ?? ''; });
        setUrls(next);
      })
      .catch(e => setError(`Could not load: ${e.message}`))
      .finally(() => setLoading(false));
  }, []);

  const replace = async (name: string, file: File | undefined) => {
    if (!file) return;
    setBusy(name); setError(''); setMessage('');
    try {
      const url = await uploadImage(file);
      await api('/admin/content', { method: 'PATCH', body: { upsert: { [`image.${name}`]: { url } } } });
      setUrls(prev => ({ ...prev, [name]: url }));
      setMessage('Image updated. It shows on the website on the next page load.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    }
    setBusy('');
  };

  const reset = async (name: string) => {
    setBusy(name); setError(''); setMessage('');
    const err = await attempt(() => api('/admin/content', { method: 'PATCH', body: { remove: [`image.${name}`] } }));
    if (err) setError(err);
    else { setUrls(prev => { const n = { ...prev }; delete n[name]; return n; }); setMessage('Restored the original image.'); }
    setBusy('');
  };

  if (loading) return <div className="empty-state">Loading...</div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="eyebrow">Website</div>
          <h1 className="page-title">Images</h1>
        </div>
      </div>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>JPG, PNG, WebP or SVG, up to 5 MB. Blog images are uploaded inside each blog post.</p>
      {error && <div className="error-alert" style={{ marginBottom: '1rem' }}>{error}</div>}
      {message && <div className="success-alert" style={{ marginBottom: '1rem' }}>{message}</div>}
      <div style={{ display: 'grid', gap: '1rem' }}>
        {SLOTS.map(s => (
          <div key={s.name} className="section-card" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {urls[s.name] ? <img src={urls[s.name]} alt={s.label} className="thumb" /> : <div className="thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>Original image</div>}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ fontWeight: 700 }}>{s.label}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{s.note}</div>
            </div>
            <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
              {busy === s.name ? 'Working…' : 'Replace'}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" hidden disabled={busy === s.name}
                onChange={e => { replace(s.name, e.target.files?.[0]); e.target.value = ''; }} />
            </label>
            {urls[s.name] && <Button variant="ghost" size="sm" onClick={() => reset(s.name)} disabled={busy === s.name}>Restore original</Button>}
          </div>
        ))}
      </div>
    </div>
  );
};
