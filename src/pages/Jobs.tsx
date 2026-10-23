import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, attempt } from '../lib/api';
import { Button } from '../components/Button';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Briefcase } from 'lucide-react';

interface Job { id: string; title: string; department: string; location: string; type: string; experience: string; is_active: boolean; created_at: string; }

export const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Job[]>('/admin/jobs')
      .then(setJobs)
      .catch(e => setError(`Could not load jobs: ${e.message}`))
      .finally(() => setLoading(false));
  }, []);

  const toggleActive = async (id: string, current: boolean) => {
    setError('');
    const err = await attempt(() => api(`/admin/jobs/${id}`, { method: 'PATCH', body: { is_active: !current } }));
    if (err) { setError(`Could not change status: ${err}`); return; }
    setJobs(prev => prev.map(j => j.id === id ? { ...j, is_active: !current } : j));
  };

  const deleteJob = async (id: string) => {
    if (!confirm('Delete this job? This cannot be undone.')) return;
    setError('');
    const err = await attempt(() => api(`/admin/jobs/${id}`, { method: 'DELETE' }));
    if (err) { setError(`Could not delete job: ${err}`); return; }
    setJobs(prev => prev.filter(j => j.id !== id));
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="eyebrow">Manage</div>
          <h1 className="page-title">Jobs</h1>
        </div>
        <Link to="/jobs/new"><Button variant="primary" leftIcon={<Plus size={15} />}>Add New Job</Button></Link>
      </div>

      {error && <div className="error-alert" style={{ marginBottom: '1rem' }}>{error}</div>}

      <div className="card">
        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : jobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Briefcase size={24} /></div>
            <div className="empty-state-title">No jobs yet</div>
            <div className="empty-state-text">Get started by adding your first job posting.</div>
            <Link to="/jobs/new"><Button variant="primary" leftIcon={<Plus size={15} />}>Add New Job</Button></Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  {['Title', 'Department', 'Location', 'Type', 'Status', 'Actions'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => (
                  <tr key={job.id}>
                    <td>
                      <div className="table-title">{job.title}</div>
                      <div className="table-subtitle">{job.experience}</div>
                    </td>
                    <td>{job.department}</td>
                    <td>{job.location}</td>
                    <td>{job.type}</td>
                    <td>
                      <button onClick={() => toggleActive(job.id, job.is_active)} className={`toggle-status ${job.is_active ? 'toggle-active' : 'toggle-inactive'}`}>
                        {job.is_active ? <ToggleRight size={19} /> : <ToggleLeft size={19} />}
                        {job.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td>
                      <div className="action-row">
                        <Link to={`/jobs/${job.id}/edit`}>
                          <button className="action-btn-icon"><Pencil size={12} /> Edit</button>
                        </Link>
                        <button onClick={() => deleteJob(job.id)} className="action-btn-icon action-btn-delete">
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
