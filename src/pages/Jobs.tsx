import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/Button';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

interface Job { id: string; title: string; department: string; location: string; type: string; experience: string; is_active: boolean; created_at: string; }

export const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    const { data } = await supabase.from('jobs').select('id,title,department,location,type,experience,is_active,created_at').order('created_at', { ascending: false });
    setJobs((data as Job[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchJobs(); }, []);

  const toggleActive = async (id: string, current: boolean) => {
    await (supabase.from('jobs') as any).update({ is_active: !current }).eq('id', id);
    setJobs(prev => prev.map(j => j.id === id ? { ...j, is_active: !current } : j));
  };

  const deleteJob = async (id: string) => {
    if (!confirm('Delete this job? This cannot be undone.')) return;
    await supabase.from('jobs').delete().eq('id', id);
    setJobs(prev => prev.filter(j => j.id !== id));
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><div className="eyebrow">Manage</div><h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>Jobs</h1></div>
        <Link to="/jobs/new"><Button variant="primary" leftIcon={<Plus size={15} />}>Add New Job</Button></Link>
      </div>

      <div style={{ backgroundColor: '#fff', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading...</div>
        ) : jobs.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No jobs yet. <Link to="/jobs/new" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Add your first job.</Link></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-subtle)' }}>
                  {['Title', 'Department', 'Location', 'Type', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '0.85rem 1.25rem', textAlign: 'left', fontSize: '0.775rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {jobs.map((job, i) => (
                  <tr key={job.id} style={{ borderBottom: i < jobs.length - 1 ? '1px solid var(--color-border-subtle)' : 'none' }}>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-heading)' }}>{job.title}</div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)' }}>{job.experience}</div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem' }}>{job.department}</td>
                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem' }}>{job.location}</td>
                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem' }}>{job.type}</td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <button onClick={() => toggleActive(job.id, job.is_active)} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.825rem', fontWeight: 600, color: job.is_active ? '#10B981' : 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                        {job.is_active ? <ToggleRight size={19} /> : <ToggleLeft size={19} />}
                        {job.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link to={`/jobs/${job.id}/edit`}>
                          <button style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', backgroundColor: 'transparent' }}>
                            <Pencil size={12} /> Edit
                          </button>
                        </Link>
                        <button onClick={() => deleteJob(job.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #FECACA', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', backgroundColor: '#FEF2F2', color: '#EF4444' }}>
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
