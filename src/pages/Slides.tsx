import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, attempt } from '../lib/api';
import { SLIDE_ICONS, type SlideIcon } from '../lib/slideIcons';
import { Button } from '../components/Button';
import { ArrowDown, ArrowUp, GalleryHorizontal, Pencil, Plus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';

interface Slide { id: string; icon: SlideIcon; tab_label_en: string; title_en: string; image_url: string | null; is_active: boolean; is_featured: boolean; }

export const Slides: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Slide[]>('/admin/slides')
      .then(setSlides)
      .catch(e => setError(`Could not load slides: ${e.message}`))
      .finally(() => setLoading(false));
  }, []);

  const move = async (index: number, by: -1 | 1) => {
    const next = [...slides];
    [next[index], next[index + by]] = [next[index + by], next[index]];
    setError('');
    const err = await attempt(async () => setSlides(await api<Slide[]>('/admin/slides/order', { method: 'PUT', body: { ids: next.map(s => s.id) } })));
    if (err) setError(`Could not change the order: ${err}`);
  };

  const toggleActive = async (slide: Slide) => {
    setError('');
    const err = await attempt(() => api(`/admin/slides/${slide.id}`, { method: 'PATCH', body: { is_active: !slide.is_active } }));
    if (err) { setError(`Could not change status: ${err}`); return; }
    setSlides(prev => prev.map(s => s.id === slide.id ? { ...s, is_active: !s.is_active } : s));
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this slide? This cannot be undone.')) return;
    setError('');
    const err = await attempt(() => api(`/admin/slides/${id}`, { method: 'DELETE' }));
    if (err) { setError(`Could not delete: ${err}`); return; }
    setSlides(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="eyebrow">Website</div>
          <h1 className="page-title">Home Slider</h1>
        </div>
        <Link to="/slides/new"><Button variant="primary" leftIcon={<Plus size={15} />}>New Slide</Button></Link>
      </div>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.25rem', maxWidth: '720px' }}>
        The "Market Focus" slider at the top of the home page. Active slides are shown in this order and change every 5 seconds.
        If no slide is active, the website shows its original slides.
      </p>
      {error && <div className="error-alert" style={{ marginBottom: '1rem' }}>{error}</div>}
      <div className="card">
        {loading ? <div className="empty-state">Loading...</div> : slides.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><GalleryHorizontal size={24} /></div>
            <div className="empty-state-title">No slides</div>
            <div className="empty-state-text">The website is showing its original slides.</div>
            <Link to="/slides/new"><Button variant="primary" leftIcon={<Plus size={15} />}>New Slide</Button></Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Order</th><th>Slide</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {slides.map((s, i) => {
                  const Icon = SLIDE_ICONS[s.icon] ?? SLIDE_ICONS.sparkles;
                  return (
                    <tr key={s.id}>
                      <td>
                        <div className="action-row">
                          <button className="action-btn-icon" title="Move up" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp size={12} /></button>
                          <button className="action-btn-icon" title="Move down" disabled={i === slides.length - 1} onClick={() => move(i, 1)}><ArrowDown size={12} /></button>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {s.image_url ? <img src={s.image_url} alt="" className="thumb" style={{ width: 64, height: 42 }} /> : <Icon size={18} color="var(--color-primary)" />}
                          <div>
                            <div className="table-title">{s.tab_label_en}{s.is_featured && ' ★'}</div>
                            <div className="table-subtitle">{s.title_en}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <button onClick={() => toggleActive(s)} className={`toggle-status ${s.is_active ? 'toggle-active' : 'toggle-inactive'}`}>
                          {s.is_active ? <ToggleRight size={19} /> : <ToggleLeft size={19} />}
                          {s.is_active ? 'Active' : 'Hidden'}
                        </button>
                      </td>
                      <td>
                        <div className="action-row">
                          <Link to={`/slides/${s.id}/edit`}><button className="action-btn-icon"><Pencil size={12} /> Edit</button></Link>
                          <button onClick={() => remove(s.id)} className="action-btn-icon action-btn-delete"><Trash2 size={12} /> Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
