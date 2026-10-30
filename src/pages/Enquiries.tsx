import React, { useEffect, useState } from 'react';
import { api, attempt } from '../lib/api';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

interface Enquiry {
  id: string; name: string; email: string; phone: string; company: string | null;
  service_requirement: string; message: string;
  status: 'new' | 'read' | 'responded'; created_at: string;
}

export const Enquiries: React.FC = () => {
  const [items, setItems] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    api<Enquiry[]>('/admin/enquiries')
      .then(setItems)
      .catch(e => setError(`Could not load enquiries: ${e.message}`))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, status: Enquiry['status']) => {
    const err = await attempt(() => api(`/admin/enquiries/${id}`, { method: 'PATCH', body: { status } }));
    if (err) { setError(err); return; }
    setItems(prev => prev.map(e => e.id === id ? { ...e, status } : e));
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this enquiry? This cannot be undone.')) return;
    const err = await attempt(() => api(`/admin/enquiries/${id}`, { method: 'DELETE' }));
    if (err) { setError(err); return; }
    setItems(prev => prev.filter(e => e.id !== id));
  };

  const filtered = filter === 'all' ? items : items.filter(e => e.status === filter);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div><div className="eyebrow">Manage</div><h1 className="page-title">Enquiries</h1></div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="select">
          {['all', 'new', 'read', 'responded'].map(s => <option key={s} value={s}>{s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {error && <div className="error-alert" style={{ marginBottom: '1rem' }}>{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {loading ? <div className="empty-state">Loading...</div>
          : filtered.length === 0 ? <div className="empty-state">No enquiries found.</div>
          : filtered.map(enq => {
            const expanded = expandedId === enq.id;
            return (
              <div key={enq.id} className="enquiry-card">
                <div className="enquiry-header"
                  onClick={() => { setExpandedId(expanded ? null : enq.id); if (!expanded && enq.status === 'new') updateStatus(enq.id, 'read'); }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--color-text-heading)' }}>{enq.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{enq.email} · {enq.service_requirement}</div>
                    </div>
                    <span className={`badge badge-${enq.status}`}>{enq.status}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{new Date(enq.created_at).toLocaleDateString()}</span>
                    {expanded ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
                  </div>
                </div>

                {expanded && (
                  <div className="enquiry-detail fade-in">
                    <div className="enquiry-info-grid">
                      {[['Phone', enq.phone], ['Company', enq.company || '—'], ['Service', enq.service_requirement]].map(([l, v]) => (
                        <div key={l}><div className="app-info-label">{l}</div><div className="app-info-value">{v}</div></div>
                      ))}
                    </div>
                    <div style={{ marginBottom: '1.25rem' }}>
                      <div className="app-info-label" style={{ marginBottom: '0.5rem' }}>Message</div>
                      <p className="enquiry-message">{enq.message}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <a href={`mailto:${enq.email}`} className="reply-btn">Reply via Email</a>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {(['new', 'read', 'responded'] as Enquiry['status'][]).map(s => (
                          <button key={s} onClick={() => updateStatus(enq.id, s)} className={`status-btn ${enq.status === s ? 'active' : ''}`}>{s}</button>
                        ))}
                      </div>
                      <button onClick={() => remove(enq.id)} className="action-btn-icon action-btn-delete"><Trash2 size={12} /> Delete</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};
