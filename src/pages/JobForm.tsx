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
  title_de: string; department_de: string; overview_de: string;
  responsibilities_de: string[]; requirements_de: string[]; preferred_skills_de: string[]; benefits_de: string[];
}

const empty: JobForm = {
  id: '', title: '', location: 'India', type: 'Full Time', experience: '3+ Years',
  department: '', posted_date: 'Recent', overview: '',
  responsibilities: [''], requirements: [''], preferred_skills: [''], benefits: [''], is_active: true,
  title_de: '', department_de: '', overview_de: '',
  responsibilities_de: [''], requirements_de: [''], preferred_skills_de: [''], benefits_de: [''],
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
    supabase.from('jobs').select('*').eq('id', id!).single().then(({ data, error: err }) => {
      if (err || !data) {
        setError(`Could not load this job: ${err?.message ?? 'not found'}`);
      } else {
        const row: any = data;
        const list = (v: unknown) => (Array.isArray(v) && v.length ? (v as string[]) : ['']);
        setForm({
          ...empty, ...row,
          title_de: row.title_de ?? '', department_de: row.department_de ?? '', overview_de: row.overview_de ?? '',
          responsibilities: list(row.responsibilities), requirements: list(row.requirements),
          preferred_skills: list(row.preferred_skills), benefits: list(row.benefits),
          responsibilities_de: list(row.responsibilities_de), requirements_de: list(row.requirements_de),
          preferred_skills_de: list(row.preferred_skills_de), benefits_de: list(row.benefits_de),
        });
      }
      setLoading(false);
    });
  }, [id, isEdit]);

  const set = (key: keyof JobForm, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    const clean = (a: string[]) => a.map(x => x.trim()).filter(Boolean);
    const orNull = (v: string) => (v.trim() ? v.trim() : null);
    const { id: _id, created_at: _c, updated_at: _u, ...rest } = form as JobForm & { created_at?: string; updated_at?: string };
    const payload = {
      ...rest,
      responsibilities: clean(form.responsibilities), requirements: clean(form.requirements),
      preferred_skills: clean(form.preferred_skills), benefits: clean(form.benefits),
      title_de: orNull(form.title_de), department_de: orNull(form.department_de), overview_de: orNull(form.overview_de),
      responsibilities_de: clean(form.responsibilities_de), requirements_de: clean(form.requirements_de),
      preferred_skills_de: clean(form.preferred_skills_de), benefits_de: clean(form.benefits_de),
    };
    if (isEdit) {
      // .select() makes a blocked update (0 rows) visible instead of looking like success.
      const { data, error: err } = await (supabase.from('jobs') as any).update(payload).eq('id', id).select('id');
      if (err || !data || data.length === 0) {
        setError(err?.message ?? 'Save was blocked: no permission to update this job. Check that you are an approved admin.');
        setSaving(false); return;
      }
    } else {
      const { error: err } = await (supabase.from('jobs') as any).insert({ id: form.id, ...payload });
      if (err) { setError(err.code === '23505' ? 'A job with this Job ID already exists. Use a different ID.' : err.message); setSaving(false); return; }
    }
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

        <div className="section-card">
          <h3 className="section-title">German Translation <span className="label-hint">(optional — English is shown when a German field is empty)</span></h3>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div className="form-grid">
              <div>
                <label className="label">Job Title (DE)</label>
                <input value={form.title_de} onChange={e => set('title_de', e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">Department (DE)</label>
                <input value={form.department_de} onChange={e => set('department_de', e.target.value)} className="input" />
              </div>
            </div>
            <div>
              <label className="label">Overview (DE)</label>
              <textarea rows={4} value={form.overview_de} onChange={e => set('overview_de', e.target.value)} className="input" style={{ resize: 'vertical' }} />
            </div>
            <ArrayField label="Responsibilities (DE)" items={form.responsibilities_de} onChange={v => set('responsibilities_de', v)} />
            <ArrayField label="Requirements (DE)" items={form.requirements_de} onChange={v => set('requirements_de', v)} />
            <ArrayField label="Preferred Skills (DE)" items={form.preferred_skills_de} onChange={v => set('preferred_skills_de', v)} />
            <ArrayField label="Benefits (DE)" items={form.benefits_de} onChange={v => set('benefits_de', v)} />
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
