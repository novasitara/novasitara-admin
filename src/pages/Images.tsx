import React, { useEffect, useState } from 'react';
import { api, attempt } from '../lib/api';
import { uploadImage } from '../lib/upload';
import { Button } from '../components/Button';
import { Upload, RotateCcw, ExternalLink, CheckCircle2 } from 'lucide-react';

interface ImageSlot {
  name: string;
  label: string;
  note: string;
  location: string;
  defaultUrl: string;
}

const SLOTS: ImageSlot[] = [
  {
    name: 'logo',
    label: 'Website Logo',
    note: 'Primary brand mark shown in header navigation, mobile drawer, and footer.',
    location: 'Global Header & Footer',
    defaultUrl: 'https://www.novasitara.com/images/logo.jpeg',
  },
  {
    name: 'hero',
    label: 'Homepage Hero Graphic',
    note: 'Main 3D architectural graphic beside the hero headline.',
    location: 'Homepage Top Hero Section',
    defaultUrl: 'https://www.novasitara.com/images/hero.png',
  },
  {
    name: 'about',
    label: 'About Section Graphic',
    note: 'Enterprise architecture & talent sourcing diagram in About preview.',
    location: 'Homepage About Section',
    defaultUrl: 'https://www.novasitara.com/images/about.png',
  },
  {
    name: 'vistex-feature',
    label: 'Vistex Specialization Graphic',
    note: 'Visual banner in the dedicated Vistex solutions feature card.',
    location: 'Homepage Vistex Section',
    defaultUrl: 'https://www.novasitara.com/images/vistex-feature.png',
  },
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
        Object.entries(content).forEach(([key, value]) => {
          if (key.startsWith('image.')) {
            next[key.slice(6)] = value?.url ?? '';
          }
        });
        setUrls(next);
      })
      .catch(e => setError(`Could not load images: ${e.message}`))
      .finally(() => setLoading(false));
  }, []);

  const replace = async (name: string, file: File | undefined) => {
    if (!file) return;
    setBusy(name); setError(''); setMessage('');
    try {
      const url = await uploadImage(file);
      await api('/admin/content', { method: 'PATCH', body: { upsert: { [`image.${name}`]: { url } } } });
      setUrls(prev => ({ ...prev, [name]: url }));
      setMessage(`Updated ${name} graphic successfully! The new image is live on the website.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    }
    setBusy('');
  };

  const reset = async (name: string) => {
    setBusy(name); setError(''); setMessage('');
    const err = await attempt(() => api('/admin/content', { method: 'PATCH', body: { remove: [`image.${name}`] } }));
    if (err) {
      setError(err);
    } else {
      setUrls(prev => {
        const n = { ...prev };
        delete n[name];
        return n;
      });
      setMessage(`Restored original default graphic for ${name}.`);
    }
    setBusy('');
  };

  if (loading) return <div className="empty-state">Loading images...</div>;

  return (
    <div className="fade-in" style={{ paddingBottom: '3rem' }}>
      <div className="page-header">
        <div>
          <div className="eyebrow">Website & Media</div>
          <h1 className="page-title">Images</h1>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Manage the brand logo and core homepage graphics. Uploaded files are served with high-performance caching.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <a
            href="https://www.novasitara.com"
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ExternalLink size={14} /> Open Live Site
          </a>
        </div>
      </div>

      {/* Sync Status Banner */}
      <div style={{
        padding: '0.85rem 1.15rem',
        borderRadius: '10px',
        background: '#F0FDF4',
        border: '1px solid #BBF7D0',
        color: '#166534',
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        marginBottom: '1.5rem',
        fontSize: '0.85rem'
      }}>
        <CheckCircle2 size={17} color="#16a34a" />
        <span>
          <strong>Live Visual Sync:</strong> Thumbnails below show the exact asset currently visible on <code>novasitara.com</code>. Click "Replace" to upload a new JPG, PNG, WebP or SVG (up to 5 MB).
        </span>
      </div>

      {error && <div className="error-alert" style={{ marginBottom: '1.25rem' }}>{error}</div>}
      {message && <div className="success-alert" style={{ marginBottom: '1.25rem' }}>{message}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {SLOTS.map(s => {
          const isCustom = Boolean(urls[s.name]);
          const currentUrl = urls[s.name] || s.defaultUrl;

          return (
            <div
              key={s.name}
              className="card"
              style={{
                padding: '1.25rem 1.5rem',
                background: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid var(--color-border)',
                display: 'flex',
                gap: '1.5rem',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}
            >
              {/* Image Preview Box */}
              <div
                style={{
                  width: '120px',
                  height: '84px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  background: '#F8FAFC',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  flexShrink: 0
                }}
              >
                <img
                  src={currentUrl}
                  alt={s.label}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    padding: '4px'
                  }}
                  onError={(e) => {
                    // Fallback to placeholder text if asset fails
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              {/* Slot Details */}
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
                    {s.label}
                  </h3>
                  {isCustom ? (
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      background: '#ECFDF5',
                      color: '#059669',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #A7F3D0'
                    }}>
                      Custom Uploaded
                    </span>
                  ) : (
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      background: '#F1F5F9',
                      color: '#64748B',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #E2E8F0'
                    }}>
                      Default Site Asset
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.835rem', color: 'var(--color-text-muted)', marginBottom: '0.35rem' }}>
                  {s.note}
                </div>

                <div style={{ fontSize: '0.75rem', color: '#6366F1', fontWeight: 500 }}>
                  Location: <strong>{s.location}</strong>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <a
                  href={currentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline btn-sm"
                  title="View full resolution image in new tab"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}
                >
                  <ExternalLink size={13} /> View
                </a>

                <label
                  className="btn btn-primary btn-sm"
                  style={{
                    cursor: busy === s.name ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.8rem',
                    opacity: busy === s.name ? 0.7 : 1
                  }}
                >
                  <Upload size={13} />
                  {busy === s.name ? 'Uploading...' : 'Replace'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    hidden
                    disabled={busy === s.name}
                    onChange={e => {
                      replace(s.name, e.target.files?.[0]);
                      e.target.value = '';
                    }}
                  />
                </label>

                {isCustom && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => reset(s.name)}
                    disabled={busy === s.name}
                    leftIcon={<RotateCcw size={13} />}
                    style={{ fontSize: '0.8rem' }}
                  >
                    Restore Default
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
