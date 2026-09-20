import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Enquiry {
  id: string; name: string; email: string; phone: string; company: string | null;
  service_requirement: string; message: string;
  status: 'new' | 'read' | 'responded'; created_at: string;
}

const SC: Record<string, { bg: string; color: string }> = {
  new: { bg: '#EFF6FF', color: '#2563EB' },
  read: { bg: '#FFF7ED', color: '#C2410C' },
  responded: { bg: '#F0FDF4', color: '#15803D' },
};

export const Enquiries: React.FC = () => {
  const [items, setItems] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    supabase.from('enquiries').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setItems((data as Enquiry[]) ?? []); setLoading(false); });
  }, []);

  const updateStatus = async (id: string, status: Enquiry['status']) => {
    await (supabase.from('enquiries') as any).update({ status }).eq('id', id);
    setItems(prev => prev.map(e => e.id === id ? { ...e, status } : e));
  };

  const filtered = filter === 'all' ? items : items.filter(e => e.status === filter);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><div className="eyebrow">Manage</div><h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>Enquiries</h1></div>
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: '0.65rem 1rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.9rem', fontFamily: 'inherit', backgroundColor: '#fff', cursor: 'pointer' }}>
          {['all', 'new', 'read', 'responded'].map(s => <option key={s} value={s}>{s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {loading ? <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)', backgroundColor: '#fff', borderRadius: 'var(--radius-xl)', border: '1.5px solid var(--color-border)' }}>Loading...</div>
          : filtered.length === 0 ? <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)', backgroundColor: '#fff', borderRadius: 'var(--radius-xl)', border: '1.5px solid var(--color-border)' }}>No enquiries found.</div>
          : filtered.map(enq => {
            const expanded = expandedId === enq.id;
            const sc = SC[enq.status];
            return (
              <div key={enq.id} style={{ backgroundColor: '#fff', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', cursor: 'pointer', flexWrap: 'wrap', gap: '0.75rem' }}
                  onClick={() => { setExpandedId(expanded ? null : enq.id); if (!expanded && enq.status === 'new') updateStatus(enq.id, 'read'); }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--color-text-heading)' }}>{enq.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{enq.email} · {enq.service_requirement}</div>
                    </div>
                    <span style={{ padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, backgroundColor: sc.bg, color: sc.color, textTransform: 'capitalize' }}>{enq.status}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{new Date(enq.created_at).toLocaleDateString()}</span>
                    {expanded ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
                  </div>
                </div>

                {expanded && (
                  <div style={{ borderTop: '1px solid var(--color-border)', padding: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                      {[['Phone', enq.phone], ['Company', enq.company || '—'], ['Service', enq.service_requirement]].map(([l, v]) => (
                        <div key={l}><div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-muted)', marginBottom: '0.2rem' }}>{l}</div><div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{v}</div></div>
                      ))}
                    </div>
                    <div style={{ marginBottom: '1.25rem' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Message</div>
                      <p style={{ fontSize: '0.9rem', lineHeight: 1.6, backgroundColor: 'var(--color-bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>{enq.message}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <a href={`mailto:${enq.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-primary)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)' }}>Reply via Email</a>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {(['new', 'read', 'responded'] as Enquiry['status'][]).map(s => (
                          <button key={s} onClick={() => updateStatus(enq.id, s)} style={{ padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-md)', border: `1.5px solid ${enq.status === s ? SC[s].color : 'var(--color-border)'}`, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', backgroundColor: enq.status === s ? SC[s].bg : 'transparent', color: enq.status === s ? SC[s].color : 'var(--color-text-muted)', textTransform: 'capitalize' }}>{s}</button>
                        ))}
                      </div>
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
