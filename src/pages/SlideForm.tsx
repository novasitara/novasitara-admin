import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, attempt } from '../lib/api';
import { uploadImage } from '../lib/upload';
import { SLIDE_ICONS, type SlideIcon } from '../lib/slideIcons';
import { ArrayField } from '../components/ArrayField';
import { Button } from '../components/Button';
import { ArrowLeft } from 'lucide-react';

interface Form {
  icon: SlideIcon; is_active: boolean; is_featured: boolean;
  tab_label_en: string; tab_label_de: string; badge_en: string; badge_de: string;
  title_en: string; title_de: string; subtitle_en: string; subtitle_de: string;
  audience_en: string; audience_de: string; tags_en: string[]; tags_de: string[];
  button_text_en: string; button_text_de: string; button_link: string; image_url: string;
}

const empty: Form = {
  icon: 'sparkles', is_active: true, is_featured: false,
  tab_label_en: '', tab_label_de: '', badge_en: '', badge_de: '', title_en: '', title_de: '', subtitle_en: '', subtitle_de: '',
  audience_en: '', audience_de: '', tags_en: [''], tags_de: [''], button_text_en: '', button_text_de: '', button_link: '', image_url: '',
};

const validUrl = (u: string) => /^(\/[^\s]*|https?:\/\/[^\s]+|mailto:[^\s]+|tel:[^\s]+)$/i.test(u.trim());

export const SlideForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id && id !== 'new');
  const [form, setForm] = useState<Form>(empty);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    api<any>(`/admin/slides/${id}`)
      .then(row => {
        const next: any = { ...empty };
        Object.keys(empty).forEach(k => { if (row[k] !== null && row[k] !== undefined) next[k] = row[k]; });
        if (!next.tags_en.length) next.tags_en = [''];
        if (!next.tags_de.length) next.tags_de = [''];
        setForm(next);
      })
      .catch(e => setError(`Could not load this slide: ${e.message}`))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const set = <K extends keyof Form>(key: K, val: Form[K]) => setForm(prev => ({ ...prev, [key]: val }));

  const onImage = async (file?: File) => {
    if (!file) return;
    setUploading(true); setError('');
    try { set('image_url', await uploadImage(file)); }
    catch (e) { setError(e instanceof Error ? e.message : 'Upload failed'); }
    setUploading(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.button_link.trim() && !validUrl(form.button_link)) { setError('Button link must start with /, https://, mailto: or tel:'); return; }
    if (form.button_link.trim() && !form.button_text_en.trim()) { setError('Add the English button text, or clear the button link.'); return; }
    setSaving(true); setError('');
    const orNull = (v: string) => (v.trim() ? v.trim() : null);
    const clean = (a: string[]) => a.map(x => x.trim()).filter(Boolean);
    const payload = {
      icon: form.icon, is_active: form.is_active, is_featured: form.is_featured,
      tab_label_en: form.tab_label_en.trim(), tab_label_de: orNull(form.tab_label_de),
      badge_en: form.badge_en.trim(), badge_de: orNull(form.badge_de),
      title_en: form.title_en.trim(), title_de: orNull(form.title_de),
      subtitle_en: form.subtitle_en.trim(), subtitle_de: orNull(form.subtitle_de),
      audience_en: orNull(form.audience_en), audience_de: orNull(form.audience_de),
      tags_en: clean(form.tags_en), tags_de: clean(form.tags_de),
      button_text_en: orNull(form.button_text_en), button_text_de: orNull(form.button_text_de),
      button_link: orNull(form.button_link), image_url: orNull(form.image_url),
    };
    const err = await attempt(() => isEdit
      ? api(`/admin/slides/${id}`, { method: 'PATCH', body: payload })
      : api('/admin/slides', { body: payload }));
    if (err) { setError(err); setSaving(false); return; }
    navigate('/slides');
  };

  if (loading) return <div className="empty-state">Loading...</div>;

  const text = (label: string, key: keyof Form, opts: { required?: boolean; rows?: number; max?: number; hint?: string } = {}) => (
    <div>
      <label className="label">{label}{opts.required && ' *'}{opts.hint && <span className="label-hint"> {opts.hint}</span>}</label>
      {opts.rows
        ? <textarea rows={opts.rows} required={opts.required} maxLength={opts.max} className="input" style={{ resize: 'vertical' }} value={form[key] as string} onChange={e => set(key, e.target.value as never)} />
        : <input required={opts.required} maxLength={opts.max} className="input" value={form[key] as string} onChange={e => set(key, e.target.value as never)} />}
    </div>
  );

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <button onClick={() => navigate('/slides')} className="back-btn"><ArrowLeft size={14} /> Back to Home Slider</button>
        <div className="eyebrow">{isEdit ? 'Edit' : 'New'}</div>
        <h1 className="page-title">{isEdit ? 'Edit Slide' : 'New Slide'}</h1>
      </div>
      <form onSubmit={submit} style={{ display: 'grid', gap: '1.5rem' }}>
        <div className="section-card">
          <h3 className="section-title">English</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div className="form-grid">
              {text('Tab label', 'tab_label_en', { required: true, max: 40, hint: '(short, shown in the slider tabs)' })}
              {text('Badge', 'badge_en', { required: true, max: 60, hint: '(e.g. ACTIVE PRIMARY FOCUS)' })}
            </div>
            {text('Title', 'title_en', { required: true, max: 200 })}
            {text('Description', 'subtitle_en', { required: true, rows: 3, max: 500 })}
            {text('Target audience', 'audience_en', { max: 200 })}
            <ArrayField label="Tags" items={form.tags_en} onChange={v => set('tags_en', v)} />
            {text('Button text', 'button_text_en', { max: 60 })}
          </div>
        </div>

        <div className="section-card">
          <h3 className="section-title">German <span className="label-hint">(optional — English is shown when a field is empty)</span></h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div className="form-grid">
              {text('Tab-Beschriftung', 'tab_label_de', { max: 40 })}
              {text('Badge', 'badge_de', { max: 60 })}
            </div>
            {text('Titel', 'title_de', { max: 200 })}
            {text('Beschreibung', 'subtitle_de', { rows: 3, max: 500 })}
            {text('Zielgruppe', 'audience_de', { max: 200 })}
            <ArrayField label="Tags (DE)" items={form.tags_de} onChange={v => set('tags_de', v)} />
            {text('Button-Text', 'button_text_de', { max: 60 })}
          </div>
        </div>

        <div className="section-card">
          <h3 className="section-title">Button, Image and Display</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {text('Button link', 'button_link', { hint: '(/services, /contact, https://… — leave empty for no button)' })}
            <div>
              <label className="label">Image <span className="label-hint">(optional, shown beside the text on larger screens)</span></label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {form.image_url ? <img src={form.image_url} alt="" className="thumb" /> : <div className="thumb" />}
                <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
                  {uploading ? 'Uploading…' : form.image_url ? 'Replace image' : 'Upload image'}
                  <input type="file" hidden accept="image/jpeg,image/png,image/webp,image/svg+xml" disabled={uploading}
                    onChange={e => { onImage(e.target.files?.[0]); e.target.value = ''; }} />
                </label>
                {form.image_url && <Button type="button" variant="ghost" size="sm" onClick={() => set('image_url', '')}>Remove</Button>}
              </div>
            </div>
            <div>
              <label className="label">Icon <span className="label-hint">(shown in the tab)</span></label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {(Object.keys(SLIDE_ICONS) as SlideIcon[]).map(name => {
                  const Icon = SLIDE_ICONS[name];
                  return (
                    <button key={name} type="button" title={name} aria-label={name} aria-pressed={form.icon === name}
                      className={`tab ${form.icon === name ? 'active' : ''}`} onClick={() => set('icon', name)}>
                      <Icon size={16} />
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="form-grid">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} /> Show on the website
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" checked={form.is_featured} onChange={e => set('is_featured', e.target.checked)} /> Mark as featured (★ on the tab)
              </label>
            </div>
          </div>
        </div>

        {error && <div className="error-alert">{error}</div>}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <Button type="button" variant="outline" onClick={() => navigate('/slides')}>Cancel</Button>
          <Button type="submit" variant="primary" isLoading={saving}>{isEdit ? 'Save Changes' : 'Create Slide'}</Button>
        </div>
      </form>
    </div>
  );
};
