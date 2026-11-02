import React, { useEffect, useState } from 'react';
import { api, attempt } from '../lib/api';
import { Button } from '../components/Button';
import { Phone, Mail, Clock, MapPin, CheckCircle2, ExternalLink } from 'lucide-react';

interface ContactField {
  key: string;
  label: string;
  placeholder: string;
  note?: string;
  type?: string;
}

interface ContactSection {
  title: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  fields: ContactField[];
}

const DEFAULT_COMPANY: Record<string, string> = {
  phone_india: '+91 8980808305',
  phone_germany: '+49 15510196326',
  email: 'info@novasitara.com',
  linkedin: 'https://www.linkedin.com/company/novasitara/',
  hours_weekdays: 'Monday – Friday: 9:00 AM – 5:00 PM',
  hours_weekends: 'Saturday – Sunday: Holiday',
  address_india: 'Ahmedabad, Gujarat, India',
  address_germany: 'Frankfurt am Main, Germany',
};

const SECTIONS: ContactSection[] = [
  {
    title: 'Telephone & Direct Numbers',
    icon: Phone,
    fields: [
      { key: 'phone_india', label: 'Phone (India)', placeholder: '+91 8980808305', note: 'Appears in Contact Page, Footer, & Mobile Drawer' },
      { key: 'phone_germany', label: 'Phone (Germany)', placeholder: '+49 15510196326', note: 'Appears in Contact Page, Footer, & Mobile Drawer' },
    ]
  },
  {
    title: 'Email & Online Presence',
    icon: Mail,
    fields: [
      { key: 'email', label: 'Public Inquiries Email', placeholder: 'info@novasitara.com', type: 'email', note: 'Clicking opens mailto: link for visitors' },
      { key: 'linkedin', label: 'Company LinkedIn URL', placeholder: 'https://www.linkedin.com/company/novasitara/', type: 'url', note: 'Full URL linked in Footer and Contact Page' },
    ]
  },
  {
    title: 'Operating Hours',
    icon: Clock,
    fields: [
      { key: 'hours_weekdays', label: 'Business Hours (Weekdays)', placeholder: 'Monday – Friday: 9:00 AM – 5:00 PM', note: 'Shows in Contact Page & Footer' },
      { key: 'hours_weekends', label: 'Business Hours (Weekends)', placeholder: 'Saturday – Sunday: Holiday', note: 'Shows in Contact Page' },
    ]
  },
  {
    title: 'Offices & Geographic Presence',
    icon: MapPin,
    fields: [
      { key: 'address_india', label: 'India Location / Hub', placeholder: 'Ahmedabad, Gujarat, India', note: 'Registered hub in India' },
      { key: 'address_germany', label: 'Germany Location / Hub', placeholder: 'Frankfurt am Main, Germany', note: 'European operations presence' },
    ]
  }
];

export const ContactInfo: React.FC = () => {
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    api<Record<string, any>>('/admin/content')
      .then(content => {
        const saved = content.company ?? {};
        // Merge saved overrides with standard website defaults so fields are always populated
        setForm({ ...DEFAULT_COMPANY, ...saved });
      })
      .catch(e => setError(`Could not load: ${e.message}`))
      .finally(() => setLoading(false));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(''); setMessage('');
    const value = Object.fromEntries(
      Object.entries(form)
        .map(([k, v]) => [k, (v ?? '').trim()])
        .filter(([, v]) => v.length > 0)
    );
    const err = await attempt(() => api('/admin/content', { method: 'PATCH', body: { upsert: { company: value } } }));
    if (err) {
      setError(err);
    } else {
      setMessage('Contact information updated successfully! Changes are live on the website (Contact Page, Footer, & Navigation).');
    }
    setSaving(false);
  };

  if (loading) return <div className="empty-state">Loading contact settings...</div>;

  return (
    <div className="fade-in" style={{ paddingBottom: '3rem' }}>
      <div className="page-header">
        <div>
          <div className="eyebrow">Website & Company</div>
          <h1 className="page-title">Contact Info</h1>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Manage phone numbers, emails, business hours, and office locations displayed across the public site.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <a
            href="https://www.novasitara.com/contact"
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ExternalLink size={14} /> View Live Contact Page
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
          <strong>Live Website Sync:</strong> Fields below reflect the current active values on <code>novasitara.com</code>. Editing and saving updates the Contact Page and Footer in real time.
        </span>
      </div>

      <form onSubmit={save} style={{ maxWidth: '820px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {SECTIONS.map(sec => {
          const Icon = sec.icon;
          return (
            <div key={sec.title} className="card" style={{ padding: '1.5rem', background: '#FFFFFF', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ width: 32, height: 32, borderRadius: '6px', background: 'var(--color-primary-light, #F3E8FF)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} />
                </div>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>{sec.title}</h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {sec.fields.map(f => (
                  <div key={f.key}>
                    <label className="label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block' }}>{f.label}</label>
                    <input
                      type={f.type ?? 'text'}
                      className="input"
                      placeholder={f.placeholder}
                      value={form[f.key] ?? ''}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      style={{ fontSize: '0.9rem' }}
                    />
                    {f.note && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.3rem' }}>{f.note}</div>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {error && <div className="error-alert">{error}</div>}
        {message && <div className="success-alert">{message}</div>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
          <Button type="submit" variant="primary" size="md" isLoading={saving}>
            Save Contact Info
          </Button>
        </div>
      </form>
    </div>
  );
};
