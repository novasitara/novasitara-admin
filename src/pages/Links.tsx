import React, { useEffect, useState } from 'react';
import { db } from '../lib/supabase';
import { Button } from '../components/Button';
import { translations } from '../lib/defaultTranslations';
import { Plus, Trash2 } from 'lucide-react';

interface LinkRow { id?: string; label_en: string; label_de: string; url: string; sort_order: number; is_active: boolean; }

const GROUPS = [
  { key: 'navbar', label: 'Top menu' },
  { key: 'footer', label: 'Footer links' },
];

const DEFAULTS: Record<string, LinkRow[]> = {
  navbar: [
    ['home', '/'], ['about', '/about'], ['services', '/services'], ['expertise', '/expertise'], ['careers', '/careers'], ['contact', '/contact'],
  ].map(([k, url], i) => ({ label_en: (translations.EN.nav as any)[k], label_de: (translations.DE.nav as any)[k], url, sort_order: i, is_active: true })),
  footer: [
    ['Home', 'Startseite', '/'], ['About Us', 'Über uns', '/about'], ['Services', 'Leistungen', '/services'],
    ['Expertise Areas', 'Fachbereiche', '/expertise'], ['Contact Us', 'Kontakt', '/contact'],
  ].map(([en, de, url], i) => ({ label_en: en, label_de: de, url, sort_order: i, is_active: true })),
};

const validUrl = (u: string) => /^(\/[^\s]*|https?:\/\/[^\s]+|mailto:[^\s]+|tel:[^\s]+)$/i.test(u.trim());

export const Links: React.FC = () => {
  const [group, setGroup] = useState('navbar');
  const [rows, setRows] = useState<LinkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async (g: string) => {
    setLoading(true); setError(''); setMessage('');
    const { data, error: err } = await db.from('site_links').select('*').eq('group_name', g).order('sort_order', { ascending: true });
    if (err) setError(`Could not load links: ${err.message}`);
    setRows((data ?? []).map((r: any) => ({ ...r, label_de: r.label_de ?? '' })));
    setLoading(false);
  };
  useEffect(() => { load(group); }, [group]);

  const update = (i: number, patch: Partial<LinkRow>) => setRows(prev => prev.map((r, idx) => idx === i ? { ...r, ...patch } : r));

  const remove = async (i: number) => {
    const row = rows[i];
    if (row.id) {
      const { error: err } = await db.from('site_links').delete().eq('id', row.id);
      if (err) { setError(err.message); return; }
    }
    setRows(prev => prev.filter((_, idx) => idx !== i));
  };

  const save = async () => {
    setError(''); setMessage('');
    const bad = rows.findIndex(r => !r.label_en.trim() || !validUrl(r.url));
    if (bad >= 0) { setError(`Row ${bad + 1}: needs an English label and a URL starting with /, https://, mailto: or tel:`); return; }
    setSaving(true);
    const payload = rows.map((r, i) => ({
      ...(r.id ? { id: r.id } : {}),
      group_name: group, label_en: r.label_en.trim(), label_de: r.label_de.trim() || null,
      url: r.url.trim(), sort_order: i, is_active: r.is_active,
    }));
    const { error: err } = await db.from('site_links').upsert(payload.filter(p => p.id));
    const fresh = payload.filter(p => !p.id);
    const { error: err2 } = fresh.length ? await db.from('site_links').insert(fresh) : { error: null };
    setSaving(false);
    if (err || err2) { setError((err ?? err2).message); return; }
    setMessage('Saved. The website shows the new links on the next page load.');
    load(group);
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="eyebrow">Website</div>
          <h1 className="page-title">Links</h1>
        </div>
      </div>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.25rem', maxWidth: '720px' }}>
        When a group has no links here, the website uses its original links. Once you add any, only the links below (that are switched on) are shown.
        Use a path like <code>/careers</code> for pages on this site, or a full address like <code>https://…</code> for external links.
      </p>
      <div className="tab-row">
        {GROUPS.map(g => <button key={g.key} className={`tab ${g.key === group ? 'active' : ''}`} onClick={() => setGroup(g.key)}>{g.label}</button>)}
      </div>

      <div className="section-card">
        {loading ? <div className="empty-state">Loading...</div> : (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {rows.length === 0 && (
              <div className="empty-state" style={{ padding: '1rem' }}>
                <div className="empty-state-text">No custom links. The website is using its original links.</div>
                <Button variant="outline" onClick={() => setRows(DEFAULTS[group])}>Start from the original links</Button>
              </div>
            )}
            {rows.map((r, i) => (
              <div key={r.id ?? `new-${i}`} className="form-grid" style={{ gridTemplateColumns: '1fr 1fr 1.4fr auto auto', alignItems: 'center' }}>
                <input className="input" placeholder="Label (English)" value={r.label_en} onChange={e => update(i, { label_en: e.target.value })} />
                <input className="input" placeholder="Label (Deutsch)" value={r.label_de} onChange={e => update(i, { label_de: e.target.value })} />
                <input className="input" placeholder="/page or https://…" value={r.url} onChange={e => update(i, { url: e.target.value })} />
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                  <input type="checkbox" checked={r.is_active} onChange={e => update(i, { is_active: e.target.checked })} /> On
                </label>
                <button type="button" className="array-field-remove" title="Delete" onClick={() => remove(i)}><Trash2 size={13} /></button>
              </div>
            ))}
            <div>
              <button type="button" className="array-field-add" onClick={() => setRows(prev => [...prev, { label_en: '', label_de: '', url: '', sort_order: prev.length, is_active: true }])}>
                <Plus size={13} /> Add link
              </button>
            </div>
          </div>
        )}
      </div>
      {error && <div className="error-alert" style={{ marginTop: '1rem' }}>{error}</div>}
      {message && <div className="success-alert" style={{ marginTop: '1rem' }}>{message}</div>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
        <Button variant="primary" onClick={save} isLoading={saving} disabled={rows.length === 0}>Save Links</Button>
      </div>
    </div>
  );
};
