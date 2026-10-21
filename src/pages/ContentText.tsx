import React, { useEffect, useMemo, useState } from 'react';
import { db } from '../lib/supabase';
import { Button } from '../components/Button';
import { translations } from '../lib/defaultTranslations';
import { RotateCcw } from 'lucide-react';

type Pair = { en: string; de: string };

function flatten(obj: unknown, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  if (obj && typeof obj === 'object') {
    Object.entries(obj as Record<string, unknown>).forEach(([k, v]) => {
      const key = prefix ? `${prefix}.${k}` : k;
      if (typeof v === 'string') out[key] = v;
      else Object.assign(out, flatten(v, key));
    });
  }
  return out;
}

const defaultsEn = flatten(translations.EN);
const defaultsDe = flatten(translations.DE);
const paths = Object.keys(defaultsEn);
const sections = Array.from(new Set(paths.map(p => p.split('.')[0])));

const pretty = (s: string) => s.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());

export const ContentText: React.FC = () => {
  const [section, setSection] = useState(sections[0]);
  const [values, setValues] = useState<Record<string, Pair>>({});
  const [saved, setSaved] = useState<Record<string, Pair>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const defaultFor = (path: string): Pair => ({ en: defaultsEn[path] ?? '', de: defaultsDe[path] ?? '' });

  useEffect(() => {
    db.from('site_content').select('key,value').like('key', 'text.%').then(({ data, error: err }: any) => {
      if (err) setError(`Could not load saved text: ${err.message}`);
      const next: Record<string, Pair> = {};
      paths.forEach(p => { next[p] = defaultFor(p); });
      (data ?? []).forEach((row: any) => {
        const p = String(row.key).slice(5);
        if (next[p]) next[p] = { en: row.value?.en ?? next[p].en, de: row.value?.de ?? next[p].de };
      });
      setValues(next);
      setSaved(next);
      setLoading(false);
    });
  }, []);

  const sectionPaths = useMemo(() => paths.filter(p => p.split('.')[0] === section), [section]);
  const isDefault = (p: string, v: Pair) => v.en === defaultsEn[p] && v.de === defaultsDe[p];
  const dirty = sectionPaths.some(p => values[p] && saved[p] && (values[p].en !== saved[p].en || values[p].de !== saved[p].de));

  const setField = (p: string, lang: 'en' | 'de', v: string) =>
    setValues(prev => ({ ...prev, [p]: { ...prev[p], [lang]: v } }));

  const save = async () => {
    setSaving(true); setError(''); setMessage('');
    const upserts: { key: string; value: Pair }[] = [];
    const removes: string[] = [];
    sectionPaths.forEach(p => {
      const v = values[p];
      if (!v) return;
      if (isDefault(p, v)) removes.push(`text.${p}`);
      else upserts.push({ key: `text.${p}`, value: { en: v.en, de: v.de } });
    });
    if (upserts.length) {
      const { error: err } = await db.from('site_content').upsert(upserts, { onConflict: 'key' });
      if (err) { setError(err.message); setSaving(false); return; }
    }
    if (removes.length) {
      const { error: err } = await db.from('site_content').delete().in('key', removes);
      if (err) { setError(err.message); setSaving(false); return; }
    }
    setSaved(prev => ({ ...prev, ...Object.fromEntries(sectionPaths.map(p => [p, values[p]])) }));
    setMessage('Saved. The website shows the new text on the next page load.');
    setSaving(false);
  };

  if (loading) return <div className="empty-state">Loading...</div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="eyebrow">Website</div>
          <h1 className="page-title">Website Text</h1>
        </div>
      </div>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.25rem', maxWidth: '720px' }}>
        Edit the English and German text shown on the website. Changed fields are highlighted. Use the reset icon to go back to the original text.
      </p>

      <div className="tab-row">
        {sections.map(s => (
          <button key={s} className={`tab ${s === section ? 'active' : ''}`} onClick={() => { setSection(s); setMessage(''); }}>{pretty(s)}</button>
        ))}
      </div>

      <div className="section-card">
        <div className="text-row text-row-head" style={{ borderBottom: '1.5px solid var(--color-border)' }}>
          <div>Field</div><div>English</div><div>Deutsch</div><div />
        </div>
        {sectionPaths.map(p => {
          const v = values[p];
          if (!v) return null;
          const edited = !isDefault(p, v);
          const long = (defaultsEn[p] ?? '').length > 70 || (defaultsDe[p] ?? '').length > 70;
          return (
            <div key={p} className={`text-row ${edited ? 'text-row-edited' : ''}`}>
              <div className="text-row-key">{p.split('.').slice(1).join('.')}</div>
              {(['en', 'de'] as const).map(lang => long ? (
                <textarea key={lang} rows={3} className="input" style={{ resize: 'vertical' }} value={v[lang]} onChange={e => setField(p, lang, e.target.value)} />
              ) : (
                <input key={lang} className="input" value={v[lang]} onChange={e => setField(p, lang, e.target.value)} />
              ))}
              <button type="button" className="array-field-remove" title="Reset to original" disabled={!edited}
                onClick={() => setValues(prev => ({ ...prev, [p]: defaultFor(p) }))}>
                <RotateCcw size={13} />
              </button>
            </div>
          );
        })}
      </div>

      {error && <div className="error-alert" style={{ marginTop: '1rem' }}>{error}</div>}
      {message && <div className="success-alert" style={{ marginTop: '1rem' }}>{message}</div>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
        <Button variant="primary" onClick={save} isLoading={saving} disabled={!dirty && !saving}>Save {pretty(section)}</Button>
      </div>
    </div>
  );
};
