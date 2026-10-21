import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../lib/supabase';
import { uploadImage } from '../lib/upload';
import { Button } from '../components/Button';
import { ArrowLeft } from 'lucide-react';

interface Form {
  slug: string; title_en: string; title_de: string; category_en: string; category_de: string;
  excerpt_en: string; excerpt_de: string; content_en: string; content_de: string;
  image_url: string; seo_title: string; seo_description: string; is_published: boolean; published_at: string | null;
}

const empty: Form = {
  slug: '', title_en: '', title_de: '', category_en: '', category_de: '', excerpt_en: '', excerpt_de: '',
  content_en: '', content_de: '', image_url: '', seo_title: '', seo_description: '', is_published: false, published_at: null,
};

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export const BlogForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id && id !== 'new');
  const [form, setForm] = useState<Form>(empty);
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    db.from('blog_posts').select('*').eq('id', id).single().then(({ data, error: err }: any) => {
      if (err || !data) setError(`Could not load this post: ${err?.message ?? 'not found'}`);
      else {
        const next: any = { ...empty };
        Object.keys(empty).forEach(k => { if (data[k] !== null && data[k] !== undefined) next[k] = data[k]; });
        setForm(next);
      }
      setLoading(false);
    });
  }, [id, isEdit]);

  const set = <K extends keyof Form>(key: K, val: Form[K]) => setForm(prev => ({ ...prev, [key]: val }));

  const onTitle = (v: string) => setForm(prev => ({ ...prev, title_en: v, slug: slugTouched ? prev.slug : slugify(v) }));

  const onImage = async (file?: File) => {
    if (!file) return;
    setUploading(true); setError('');
    try { set('image_url', await uploadImage(file, 'blog')); }
    catch (e) { setError(e instanceof Error ? e.message : 'Upload failed'); }
    setUploading(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[a-z0-9-]+$/.test(form.slug)) { setError('Slug may only contain lowercase letters, numbers and dashes.'); return; }
    setSaving(true); setError('');
    const orNull = (v: string) => (v.trim() ? v.trim() : null);
    const payload = {
      slug: form.slug, title_en: form.title_en.trim(), title_de: orNull(form.title_de),
      category_en: orNull(form.category_en), category_de: orNull(form.category_de),
      excerpt_en: orNull(form.excerpt_en), excerpt_de: orNull(form.excerpt_de),
      content_en: orNull(form.content_en), content_de: orNull(form.content_de),
      image_url: orNull(form.image_url), seo_title: orNull(form.seo_title), seo_description: orNull(form.seo_description),
      is_published: form.is_published,
      published_at: form.is_published ? (form.published_at ?? new Date().toISOString()) : form.published_at,
    };
    const res = isEdit
      ? await db.from('blog_posts').update(payload).eq('id', id).select('id')
      : await db.from('blog_posts').insert(payload).select('id');
    if (res.error || !res.data?.length) {
      setError(res.error?.code === '23505' ? 'A post with this slug already exists.' : (res.error?.message ?? 'Save was blocked: no permission. Check that you are an approved admin.'));
      setSaving(false); return;
    }
    navigate('/blogs');
  };

  if (loading) return <div className="empty-state">Loading...</div>;

  const field = (label: string, key: keyof Form, opts: { rows?: number; hint?: string } = {}) => (
    <div>
      <label className="label">{label}{opts.hint && <span className="label-hint"> {opts.hint}</span>}</label>
      {opts.rows
        ? <textarea rows={opts.rows} className="input" style={{ resize: 'vertical' }} value={form[key] as string} onChange={e => set(key, e.target.value as never)} />
        : <input className="input" value={form[key] as string} onChange={e => set(key, e.target.value as never)} />}
    </div>
  );

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <button onClick={() => navigate('/blogs')} className="back-btn"><ArrowLeft size={14} /> Back to Blogs</button>
        <div className="eyebrow">{isEdit ? 'Edit' : 'New'}</div>
        <h1 className="page-title">{isEdit ? 'Edit Post' : 'New Post'}</h1>
      </div>
      <form onSubmit={submit} style={{ display: 'grid', gap: '1.5rem' }}>
        <div className="section-card">
          <h3 className="section-title">English</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label className="label">Title *</label>
              <input required className="input" value={form.title_en} onChange={e => onTitle(e.target.value)} />
            </div>
            <div>
              <label className="label">URL slug * <span className="label-hint">(page address: /insights/your-slug)</span></label>
              <input required className="input" value={form.slug} onChange={e => { setSlugTouched(true); set('slug', slugify(e.target.value)); }} />
            </div>
            {field('Category', 'category_en')}
            {field('Short excerpt', 'excerpt_en', { rows: 3, hint: '(shown on the card)' })}
            {field('Full article', 'content_en', { rows: 10, hint: '(plain text; leave a blank line between paragraphs)' })}
          </div>
        </div>

        <div className="section-card">
          <h3 className="section-title">German <span className="label-hint">(optional — English is shown when empty)</span></h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {field('Titel', 'title_de')}
            {field('Kategorie', 'category_de')}
            {field('Kurzbeschreibung', 'excerpt_de', { rows: 3 })}
            {field('Vollständiger Artikel', 'content_de', { rows: 10 })}
          </div>
        </div>

        <div className="section-card">
          <h3 className="section-title">Image, SEO and Status</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {form.image_url ? <img src={form.image_url} alt="" className="thumb" /> : <div className="thumb" />}
              <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
                {uploading ? 'Uploading…' : 'Upload cover image'}
                <input type="file" hidden accept="image/jpeg,image/png,image/webp,image/svg+xml" disabled={uploading}
                  onChange={e => { onImage(e.target.files?.[0]); e.target.value = ''; }} />
              </label>
              {form.image_url && <Button type="button" variant="ghost" size="sm" onClick={() => set('image_url', '')}>Remove</Button>}
            </div>
            {field('SEO title', 'seo_title')}
            {field('SEO description', 'seo_description', { rows: 2 })}
            <div>
              <label className="label">Status</label>
              <select className="select" style={{ width: '100%' }} value={form.is_published ? 'published' : 'draft'} onChange={e => set('is_published', e.target.value === 'published')}>
                <option value="draft">Draft (not visible on the website)</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
        </div>

        {error && <div className="error-alert">{error}</div>}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <Button type="button" variant="outline" onClick={() => navigate('/blogs')}>Cancel</Button>
          <Button type="submit" variant="primary" isLoading={saving}>{isEdit ? 'Save Changes' : 'Create Post'}</Button>
        </div>
      </form>
    </div>
  );
};
