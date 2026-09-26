import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/Button';
import { ArrowLeft, Plus, X } from 'lucide-react';

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
    <label className="label">{label}</label>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {items.map((item, i) => (
        <div key={i} className="array-field-row">
          <input value={item} onChange={e => { const n = [...items]; n[i] = e.target.value; onChange(n); }} className="input" style={{ flex: 1 }} placeholder={`${label} ${i + 1}`} />
          {items.length > 1 && <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="array-field-remove"><X size={13} /></button>}
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, ''])} className="array-field-add">
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

  if (loading) return <div className="empty-state">Loading...</div>;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <button onClick={() => navigate('/jobs')} className="back-btn">
          <ArrowLeft size={14} /> Back to Jobs
        </button>
        <div className="eyebrow">{isEdit ? 'Edit' : 'New'}</div>
        <h1 className="page-title">{isEdit ? 'Edit Job' : 'Add New Job'}</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
        <div className="section-card">
          <h3 className="section-title">Basic Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem' }}>
            {!isEdit && (
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="label">Job ID * <span className="label-hint">(slug e.g. sap-sd-consultant)</span></label>
                <input required value={form.id} onChange={e => set('id', e.target.value.toLowerCase().replace(/\s+/g, '-'))} className="input" placeholder="sap-sd-consultant" />
              </div>
            )}
            {([['title', 'Job Title *', 'SAP SD Consultant'], ['department', 'Department *', 'SAP Functional Practice'], ['location', 'Location *', 'India'], ['experience', 'Experience *', '3+ Years']] as [keyof JobForm, string, string][]).map(([key, label, placeholder]) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input required value={form[key] as string} onChange={e => set(key, e.target.value)} className="input" placeholder={placeholder} />
              </div>
            ))}
            <div>
              <label className="label">Type</label>
              <select value={form.type} onChange={e => set('type', e.target.value)} className="select" style={{ width: '100%' }}>
                {['Full Time', 'Part Time', 'Contract', 'Remote'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select value={form.is_active ? 'active' : 'inactive'} onChange={e => set('is_active', e.target.value === 'active')} className="select" style={{ width: '100%' }}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="section-card">
          <h3 className="section-title">Job Description</h3>
          <div>
            <label className="label">Overview *</label>
            <textarea required rows={4} value={form.overview} onChange={e => set('overview', e.target.value)} className="input" style={{ resize: 'vertical' }} placeholder="Describe the role..." />
          </div>
        </div>

        <div className="section-card">
          <h3 className="section-title">Details</h3>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <ArrayField label="Responsibilities" items={form.responsibilities} onChange={v => set('responsibilities', v)} />
            <ArrayField label="Requirements" items={form.requirements} onChange={v => set('requirements', v)} />
            <ArrayField label="Preferred Skills" items={form.preferred_skills} onChange={v => set('preferred_skills', v)} />
            <ArrayField label="Benefits" items={form.benefits} onChange={v => set('benefits', v)} />
          </div>
        </div>

        {error && <div className="error-alert">{error}</div>}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <Button type="button" variant="outline" onClick={() => navigate('/jobs')}>Cancel</Button>
          <Button type="submit" variant="primary" isLoading={saving}>{isEdit ? 'Save Changes' : 'Create Job'}</Button>
        </div>
      </form>
    </div>
  );
};
