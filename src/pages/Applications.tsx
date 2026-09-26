import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Download, ChevronDown, ChevronUp, ExternalLink, Users, Briefcase } from 'lucide-react';

interface Application {
  id: string; job_id: string; full_name: string; email: string; phone: string;
  current_location: string; years_of_experience: string; primary_skill: string;
  linkedin_url: string | null; cover_letter: string | null;
  resume_file_url: string | null; resume_file_name: string | null;
  status: 'new' | 'reviewed' | 'shortlisted' | 'rejected'; created_at: string;
}

interface JobGroup {
  job_id: string;
  applications: Application[];
}

const DownloadResume: React.FC<{ filePath: string; fileName: string | null }> = ({ filePath, fileName }) => {
  const handleDownload = async () => {
    const { data, error } = await supabase.storage.from('resumes').createSignedUrl(filePath, 60);
    if (error || !data) { alert('Could not generate download link.'); return; }
    window.open(data.signedUrl, '_blank');
  };
  return (
    <button onClick={handleDownload} className="download-btn">
      <Download size={13} /> {fileName ?? 'Resume'}
    </button>
  );
};

const ApplicationCard: React.FC<{
  app: Application;
  expanded: boolean;
  onToggle: () => void;
  onStatusChange: (id: string, status: Application['status']) => void;
}> = ({ app, expanded, onToggle, onStatusChange }) => {
  return (
    <div className="app-card">
      {/* Card Header */}
      <div className="app-card-header" onClick={onToggle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0 }}>
          {/* Avatar */}
          <div className="avatar avatar-md avatar-primary">
            {app.full_name.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-heading)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{app.full_name}</div>
            <div style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{app.email}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
          <span className={`badge badge-${app.status}`}>{app.status}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{new Date(app.created_at).toLocaleDateString()}</span>
          {expanded ? <ChevronUp size={15} color="var(--color-text-muted)" /> : <ChevronDown size={15} color="var(--color-text-muted)" />}
        </div>
      </div>

      {/* Expanded Detail */}
      {expanded && (
        <div className="app-card-detail fade-in">
          {/* Info Grid */}
          <div className="app-info-grid">
            {[
              ['Phone', app.phone],
              ['Location', app.current_location],
              ['Experience', app.years_of_experience],
              ['Primary Skill', app.primary_skill],
            ].map(([label, value]) => (
              <div key={label} className="app-info-item">
                <div className="app-info-label">{label}</div>
                <div className="app-info-value">{value}</div>
              </div>
            ))}
          </div>

          {/* LinkedIn */}
          {app.linkedin_url && (
            <a href={app.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.825rem', color: 'var(--color-primary)', fontWeight: 600, marginBottom: '0.85rem' }}>
              <ExternalLink size={13} /> LinkedIn Profile
            </a>
          )}

          {/* Cover Letter */}
          {app.cover_letter && (
            <div style={{ marginBottom: '1rem' }}>
              <div className="app-info-label" style={{ marginBottom: '0.4rem' }}>Cover Letter</div>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--color-text-body)', backgroundColor: '#fff', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>{app.cover_letter}</p>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            {app.resume_file_url && <DownloadResume filePath={app.resume_file_url} fileName={app.resume_file_name} />}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {(['new', 'reviewed', 'shortlisted', 'rejected'] as Application['status'][]).map(s => (
                <button key={s} onClick={() => onStatusChange(app.id, s)}
                  className={`status-btn ${app.status === s ? 'active' : ''}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const Applications: React.FC = () => {
  const [items, setItems] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedJobs, setExpandedJobs] = useState<Record<string, boolean>>({});
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    supabase.from('applications').select('*').order('created_at', { ascending: false })
      .then(({ data }) => {
        const apps = (data as Application[]) ?? [];
        setItems(apps);
        // Auto-expand all job groups by default
        const jobIds = [...new Set(apps.map(a => a.job_id))];
        const expanded: Record<string, boolean> = {};
        jobIds.forEach(id => { expanded[id] = true; });
        setExpandedJobs(expanded);
        setLoading(false);
      });
  }, []);

  const updateStatus = async (id: string, status: Application['status']) => {
    await (supabase.from('applications') as any).update({ status }).eq('id', id);
    setItems(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const toggleJob = (jobId: string) => setExpandedJobs(prev => ({ ...prev, [jobId]: !prev[jobId] }));

  const filtered = statusFilter === 'all' ? items : items.filter(a => a.status === statusFilter);

  // Group by job_id
  const groups: JobGroup[] = [...new Set(filtered.map(a => a.job_id))].map(job_id => ({
    job_id,
    applications: filtered.filter(a => a.job_id === job_id),
  }));

  const totalNew = items.filter(a => a.status === 'new').length;

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="eyebrow">Manage</div>
          <h1 className="page-title">Applications</h1>
          {totalNew > 0 && <p style={{ fontSize: '0.875rem', color: '#2563EB', fontWeight: 600, marginTop: '0.25rem' }}>{totalNew} new application{totalNew > 1 ? 's' : ''} pending review</p>}
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="select">
          {['all', 'new', 'reviewed', 'shortlisted', 'rejected'].map(s => (
            <option key={s} value={s}>{s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="empty-state">Loading applications...</div>
      ) : groups.length === 0 ? (
        <div className="empty-state">
          <Users size={36} className="empty-state-icon" style={{ margin: '0 auto 1rem' }} />
          <p>No applications found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {groups.map(({ job_id, applications }) => {
            const isJobExpanded = expandedJobs[job_id] !== false;
            const newCount = applications.filter(a => a.status === 'new').length;
            return (
              <div key={job_id} className="job-group">
                {/* Job Group Header */}
                <div onClick={() => toggleJob(job_id)} className="job-group-header" style={{ borderBottom: isJobExpanded ? '1px solid var(--color-border)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="job-group-icon">
                      <Briefcase size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-heading)', textTransform: 'capitalize' }}>
                        {job_id.replace(/-/g, ' ')}
                      </div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)' }}>
                        {applications.length} applicant{applications.length !== 1 ? 's' : ''}
                        {newCount > 0 && <span style={{ marginLeft: '0.5rem', color: '#2563EB', fontWeight: 700 }}>· {newCount} new</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {/* Status summary pills */}
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {(['new', 'shortlisted'] as Application['status'][]).map(s => {
                        const count = applications.filter(a => a.status === s).length;
                        if (!count) return null;
                        return <span key={s} className={`badge badge-${s}`}>{count} {s}</span>;
                      })}
                    </div>
                    {isJobExpanded ? <ChevronUp size={17} color="var(--color-text-muted)" /> : <ChevronDown size={17} color="var(--color-text-muted)" />}
                  </div>
                </div>

                {/* Applications List */}
                {isJobExpanded && (
                  <div className="job-group-body">
                    {applications.map(app => (
                      <ApplicationCard
                        key={app.id}
                        app={app}
                        expanded={expandedId === app.id}
                        onToggle={() => setExpandedId(expandedId === app.id ? null : app.id)}
                        onStatusChange={updateStatus}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
