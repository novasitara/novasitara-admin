import React, { useEffect, useState } from 'react';
import { db } from '../lib/supabase';
import { Button } from '../components/Button';

const FIELDS: { key: string; label: string; placeholder: string; type?: string }[] = [
  { key: 'phone_india', label: 'Phone (India)', placeholder: '+91 8980808305' },
  { key: 'phone_germany', label: 'Phone (Germany)', placeholder: '+49 15510196326' },
  { key: 'email', label: 'Contact Email', placeholder: 'info@novasitara.com', type: 'email' },
  { key: 'linkedin', label: 'LinkedIn URL', placeholder: 'https://www.linkedin.com/company/novasitara/', type: 'url' },
  { key: 'hours_weekdays', label: 'Business Hours (weekdays)', placeholder: 'Monday – Friday: 9:00 AM – 5:00 PM' },
  { key: 'hours_weekends', label: 'Business Hours (weekends)', placeholder: 'Saturday – Sunday: Holiday' },
];

export const ContactInfo: React.FC = () => {
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    db.from('site_content').select('value').eq('key', 'company').maybeSingle().then(({ data, error: err }: any) => {
      if (err) setError(`Could not load: ${err.message}`);
      setForm(data?.value ?? {});
      setLoading(false);
    });
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(''); setMessage('');
    const value = Object.fromEntries(Object.entries(form).filter(([, v]) => v.trim()).map(([k, v]) => [k, v.trim()]));
    const { error: err } = await db.from('site_content').upsert({ key: 'company', value }, { onConflict: 'key' });
    if (err) setError(err.message); else setMessage('Saved. Empty fields use the original website values.');
    setSaving(false);
  };

  if (loading) return <div className="empty-state">Loading...</div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="eyebrow">Website</div>
          <h1 className="page-title">Contact Info</h1>
        </div>
      </div>
      <form onSubmit={save} className="section-card" style={{ display: 'grid', gap: '1rem', maxWidth: '720px' }}>
        {FIELDS.map(f => (
          <div key={f.key}>
            <label className="label">{f.label}</label>
            <input type={f.type ?? 'text'} className="input" placeholder={f.placeholder} value={form[f.key] ?? ''}
              onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} />
          </div>
        ))}
        {error && <div className="error-alert">{error}</div>}
        {message && <div className="success-alert">{message}</div>}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" variant="primary" isLoading={saving}>Save Contact Info</Button>
        </div>
      </form>
    </div>
  );
};
