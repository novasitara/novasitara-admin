import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Database, Download, Play, RefreshCw, CheckCircle2, AlertCircle, HardDrive, Terminal, ShieldCheck, Copy, Check } from 'lucide-react';

interface BackupItem {
  date: string;
  dbFile: string | null;
  dbSize: number;
  filesArchive: string | null;
  filesSize: number;
  totalSize: number;
  timestamp: string;
}

interface BackupsResponse {
  configured: boolean;
  schedule: string;
  location: string;
  backups: BackupItem[];
}

export const Backups: React.FC = () => {
  const [data, setData] = useState<BackupsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const loadBackups = async () => {
    try {
      const res = await api<BackupsResponse>('/admin/backups');
      setData(res);
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to load backups', error: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBackups();
  }, []);

  const handleRunBackup = async () => {
    setCreating(true);
    setMessage(null);
    try {
      const res = await api<{ success: boolean; message: string }>('/admin/backups/run', { method: 'POST' });
      setMessage({ text: res.message || 'Backup completed successfully!' });
      await loadBackups();
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to trigger backup', error: true });
    } finally {
      setCreating(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes <= 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const copyCommand = (cmd: string, index: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const restoreSteps = [
    { title: '1. Stop the API service', cmd: 'systemctl stop novasitara-api' },
    { title: '2. Restore Database Dump', cmd: 'runuser -u postgres -- pg_restore --clean --if-exists -d novasitara /var/backups/novasitara/db-YYYY-MM-DD.dump' },
    { title: '3. Restore Uploaded Files', cmd: 'tar -xzf /var/backups/novasitara/files-YYYY-MM-DD.tar.gz -C /var/lib/novasitara && chown -R novasitara:novasitara /var/lib/novasitara' },
    { title: '4. Restart the API service', cmd: 'systemctl start novasitara-api' },
  ];

  return (
    <div className="fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>Server Backups & Recovery</h1>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Automated server snapshots of PostgreSQL database and uploaded resumes/media.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={loadBackups}
            disabled={loading}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh
          </button>
          <button
            onClick={handleRunBackup}
            disabled={creating}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {creating ? <RefreshCw size={16} className="spin" /> : <Play size={16} />}
            {creating ? 'Creating Snapshot...' : 'Run Backup Now'}
          </button>
        </div>
      </div>

      {message && (
        <div style={{
          padding: '0.875rem 1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.875rem',
          background: message.error ? '#FEF2F2' : '#F0FDF4',
          color: message.error ? '#991B1B' : '#166534',
          border: `1px solid ${message.error ? '#FECACA' : '#BBF7D0'}`
        }}>
          {message.error ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Info Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.25rem', background: '#FFFFFF', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '8px', background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Cron Status</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)' }}>Active (Twice Daily Check)</div>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            Schedule: <strong>{data?.schedule || 'Daily at 02:30 AM'}</strong>
          </p>
        </div>

        <div className="card" style={{ padding: '1.25rem', background: '#FFFFFF', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '8px', background: '#EEF2FF', color: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Database size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Available Backups</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)' }}>{data?.backups.length ?? 0} Snapshots</div>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            Retention: <strong>14 rolling days kept automatically</strong>
          </p>
        </div>

        <div className="card" style={{ padding: '1.25rem', background: '#FFFFFF', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '8px', background: '#FFFBEB', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HardDrive size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Storage Path</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)', fontFamily: 'monospace' }}>/var/backups/novasitara</div>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            Contains compressed SQL dump & uploads tar.gz
          </p>
        </div>
      </div>

      {/* Backups Table */}
      <div className="card" style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid var(--color-border)', overflow: 'hidden', marginBottom: '2rem' }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>Available Snapshots on Server</h2>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Click download to save an offsite copy</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg-subtle, #F8FAFC)', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '0.75rem 1.25rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Date / Snapshot</th>
                <th style={{ padding: '0.75rem 1.25rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>PostgreSQL Database</th>
                <th style={{ padding: '0.75rem 1.25rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Uploaded Files</th>
                <th style={{ padding: '0.75rem 1.25rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Total Size</th>
                <th style={{ padding: '0.75rem 1.25rem', fontWeight: 600, color: 'var(--color-text-muted)', textAlign: 'right' }}>Download</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    <RefreshCw size={20} className="spin" style={{ margin: '0 auto 0.5rem' }} />
                    <div>Loading server backups...</div>
                  </td>
                </tr>
              ) : !data?.backups.length ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No backups found on server. Click "Run Backup Now" to create your first snapshot.
                  </td>
                </tr>
              ) : (
                data.backups.map((b) => (
                  <tr key={b.date} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Database size={16} color="var(--color-primary)" />
                        <span>{b.date}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                        {new Date(b.timestamp).toLocaleString()}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      {b.dbFile ? (
                        <div>
                          <div style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>{b.dbFile}</div>
                          <span style={{ fontSize: '0.75rem', color: '#059669', background: '#ECFDF5', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                            {formatSize(b.dbSize)}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)' }}>Not created</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      {b.filesArchive ? (
                        <div>
                          <div style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>{b.filesArchive}</div>
                          <span style={{ fontSize: '0.75rem', color: '#4F46E5', background: '#EEF2FF', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                            {formatSize(b.filesSize)}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)' }}>Not created</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>
                      {formatSize(b.totalSize)}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        {b.dbFile && (
                          <a
                            href={`/api/admin/backups/download/${b.dbFile}`}
                            className="btn btn-secondary btn-sm"
                            download
                            title="Download Database Dump"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}
                          >
                            <Download size={14} /> DB
                          </a>
                        )}
                        {b.filesArchive && (
                          <a
                            href={`/api/admin/backups/download/${b.filesArchive}`}
                            className="btn btn-secondary btn-sm"
                            download
                            title="Download Files Archive"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}
                          >
                            <Download size={14} /> Files
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restoration Instructions Section */}
      <div className="card" style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid var(--color-border)', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <Terminal size={22} color="var(--color-primary)" />
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>Restoration Guide</h2>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              To restore the system to a previous snapshot, log in to your VPS terminal (SSH port 7576) and execute:
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {restoreSteps.map((step, idx) => (
            <div key={step.title} style={{ background: 'var(--color-bg-subtle, #F8FAFC)', borderRadius: '8px', padding: '1rem', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)' }}>{step.title}</span>
                <button
                  type="button"
                  onClick={() => copyCommand(step.cmd, idx)}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    color: copiedIndex === idx ? '#10B981' : 'var(--color-text-muted)',
                    fontSize: '0.75rem'
                  }}
                >
                  {copiedIndex === idx ? <Check size={14} /> : <Copy size={14} />}
                  {copiedIndex === idx ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre style={{
                margin: 0,
                background: '#1E293B',
                color: '#F8FAFC',
                padding: '0.75rem',
                borderRadius: '6px',
                fontSize: '0.8125rem',
                overflowX: 'auto',
                fontFamily: 'monospace'
              }}>
                {step.cmd}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
