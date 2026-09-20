import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/Button';
import { ArrowLeft, Plus, X } from 'lucide-react';

const inp: React.CSSProperties = { width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.925rem', fontFamily: 'inherit', outline: 'none' };
const lbl: React.CSSProperties = { display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' };

interface JobForm {
  id: string; title: string; location: string; type: string; experience: string;
  department: string; posted_date: string; overview: string;
  responsibilities: string[]; requirements: string[]; preferred_skills: string[]; benefits: string[];
  is_active: boolean;
}

const empty: JobForm = {
  id: '', title: '', location: 'India', type: 'Full Time', experience: '3+ Years',
  department: '', posted_date: 'Recent', overview: '',
  responsibilities: [''], requirements: [''], preferred_skills: [''], benefits: [''], is_active: true,
};

const ArrayField: React.FC<{ label: string; items: string[]; onChange: (v: string[]) => void }> = ({ label, items, onChange }) => (
  <div>
    <label style={lbl}>{label}</label>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: '0.5rem' }}>
          <input value={item} onChange={e => { const n = [...items]; n[i] = e.target.value; onChange(n); }} style={{ ...inp, flex: 1 }} placeholder={`${label} ${i + 1}`} />
          {items.length > 1 && <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))} style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #FECACA', backgroundColor: '#FEF2F2', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X size={13} /></button>}
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, ''])} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-border)', fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-primary)', backgroundColor: 'transparent', cursor: 'pointer', width: 'fit-content' }}>
        <Plus size={13} /> Add item
      </button>
    </div>
  </div>
);

export const JobForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id && id !== 'new');
  const [form, setForm] = useState<JobForm>(empty);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    supabase.from('jobs').select('*').eq('id', id!).single().then(({ data }) => {
      if (data) setForm(data as JobForm);
      setLoading(false);
    });
  }, [id, isEdit]);

  const set = (key: keyof JobForm, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    const payload = { ...form, responsibilities: form.responsibilities.filter(Boolean), requirements: form.requirements.filter(Boolean), preferred_skills: form.preferred_skills.filter(Boolean), benefits: form.benefits.filter(Boolean) };
    const { error: err } = isEdit
      ? await (supabase.from('jobs') as any).update(payload).eq('id', id)
      : await (supabase.from('jobs') as any).insert(payload);
    if (err) { setError(err.message); setSaving(false); return; }
    navigate('/jobs');
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading...</div>;

  const section = (title: string, children: React.ReactNode) => (
    <div style={{ backgroundColor: '#fff', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.75rem' }}>
      <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>{title}</h3>
      {children}
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <button onClick={() => navigate('/jobs')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '0.75rem', cursor: 'pointer' }}>
          <ArrowLeft size={14} /> Back to Jobs
        </button>
        <div className="eyebrow">{isEdit ? 'Edit' : 'New'}</div>
        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>{isEdit ? 'Edit Job' : 'Add New Job'}</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
        {section('Basic Information',
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem' }}>
            {!isEdit && (
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={lbl}>Job ID * <span style={{ fontWeight: 400, color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>(slug e.g. sap-sd-consultant)</span></label>
                <input required value={form.id} onChange={e => set('id', e.target.value.toLowerCase().replace(/\s+/g, '-'))} style={inp} placeholder="sap-sd-consultant" />
              </div>
            )}
            {([['title', 'Job Title *', 'SAP SD Consultant'], ['department', 'Department *', 'SAP Functional Practice'], ['location', 'Location *', 'India'], ['experience', 'Experience *', '3+ Years']] as [keyof JobForm, string, string][]).map(([key, label, placeholder]) => (
              <div key={key}>
                <label style={lbl}>{label}</label>
                <input required value={form[key] as string} onChange={e => set(key, e.target.value)} style={inp} placeholder={placeholder} />
              </div>
            ))}
            <div>
              <label style={lbl}>Type</label>
              <select value={form.type} onChange={e => set('type', e.target.value)} style={inp}>
                {['Full Time', 'Part Time', 'Contract', 'Remote'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Status</label>
              <select value={form.is_active ? 'active' : 'inactive'} onChange={e => set('is_active', e.target.value === 'active')} style={inp}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        )}

        {section('Job Description',
          <div>
            <label style={lbl}>Overview *</label>
            <textarea required rows={4} value={form.overview} onChange={e => set('overview', e.target.value)} style={{ ...inp, resize: 'vertical' }} placeholder="Describe the role..." />
          </div>
        )}

        {section('Details',
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <ArrayField label="Responsibilities" items={form.responsibilities} onChange={v => set('responsibilities', v)} />
            <ArrayField label="Requirements" items={form.requirements} onChange={v => set('requirements', v)} />
            <ArrayField label="Preferred Skills" items={form.preferred_skills} onChange={v => set('preferred_skills', v)} />
            <ArrayField label="Benefits" items={form.benefits} onChange={v => set('benefits', v)} />
          </div>
        )}

        {error && <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#EF4444', fontSize: '0.875rem' }}>{error}</div>}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <Button type="button" variant="outline" onClick={() => navigate('/jobs')}>Cancel</Button>
          <Button type="submit" variant="primary" isLoading={saving}>{isEdit ? 'Save Changes' : 'Create Job'}</Button>
        </div>
      </form>
    </div>
  );
};
