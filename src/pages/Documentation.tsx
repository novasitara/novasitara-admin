import React, { useState } from 'react';
import { Server, Layers, FileText, Mail, HardDrive, Terminal, Check, Copy, Globe } from 'lucide-react';

export const Documentation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'admin' | 'forms' | 'server' | 'backups' | 'dev'>('architecture');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const tabs = [
    { id: 'architecture', label: '1. Architecture & Domains', icon: Layers },
    { id: 'admin', label: '2. Admin Controls Guide', icon: FileText },
    { id: 'forms', label: '3. Forms & Resumes', icon: Mail },
    { id: 'server', label: '4. VPS & Server Commands', icon: Server },
    { id: 'backups', label: '5. Backups & Restoration', icon: HardDrive },
    { id: 'dev', label: '6. Local Development', icon: Terminal },
  ] as const;

  return (
    <div className="fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
          Nova Sitara System Documentation & Handover
        </h1>
        <p style={{ margin: '0.25rem 0 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Complete operational reference, server commands, content guides, and disaster recovery procedures.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        overflowX: 'auto',
        borderBottom: '1px solid var(--color-border)',
        marginBottom: '1.5rem',
        paddingBottom: '0.25rem'
      }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1rem',
                border: 'none',
                background: isActive ? 'var(--color-primary)' : 'transparent',
                color: isActive ? '#FFFFFF' : 'var(--color-text)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Architecture */}
      {activeTab === 'architecture' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem', background: '#FFFFFF', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Globe size={20} color="var(--color-primary)" /> Production Domains & Mapping
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>Main Website (Vercel)</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0.25rem 0' }}>https://www.novasitara.com</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Vite + React SPA hosted on Vercel. Proxies <code>/api</code> and <code>/uploads</code> to the backend.</div>
              </div>
              <div style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontWeight: 600, color: '#6366F1' }}>Admin Panel (Vercel)</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0.25rem 0' }}>https://admin.novasitara.com</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Vite + React Admin dashboard. Authenticates using secure <code>httpOnly</code> first-party cookies.</div>
              </div>
              <div style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontWeight: 600, color: '#10B981' }}>Backend API (VPS Ubuntu)</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0.25rem 0' }}>https://api.novasitara.com</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>NestJS + PostgreSQL (Prisma) on Hostinger VPS (IP: <code>103.135.230.42</code>).</div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem', background: '#FFFFFF', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.75rem' }}>Traffic Flow & Security Model</h2>
            <div style={{ background: '#1E293B', color: '#E2E8F0', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.8125rem', lineHeight: '1.6' }}>
              {`Browser (Visitor / Admin)
  ├──► https://www.novasitara.com (Vercel SPA)
  │      └── /api/* and /uploads/* rewrites ────┐
  ├──► https://admin.novasitara.com (Vercel SPA)│
  │      └── /api/* and /uploads/* rewrites ────┼──► Nginx (HTTPS :443) ──► NestJS API (127.0.0.1:3000)
  │                                             │                                  ├──► PostgreSQL Database
  └─────────────────────────────────────────────┘                                  └──► /var/lib/novasitara/storage`}
            </div>
            <ul style={{ margin: '1rem 0 0 1.25rem', fontSize: '0.875rem', color: 'var(--color-text)', lineHeight: '1.6' }}>
              <li><strong>Zero CORS Issues:</strong> Because Vercel proxies <code>/api</code> and <code>/uploads</code>, the browser sees all requests as first-party requests.</li>
              <li><strong>Secure Cookies:</strong> Admin login cookie (<code>ns_admin</code>) has <code>SameSite=Lax</code> and <code>Secure</code> flags.</li>
              <li><strong>Database Protection:</strong> PostgreSQL runs on port 5432 bound to localhost only. It is completely blocked from the public internet.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 2: Admin Controls */}
      {activeTab === 'admin' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem', background: '#FFFFFF', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>Managing Content & German Translations</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 0.5rem', color: 'var(--color-primary)' }}>1. Home Slider (/slides)</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.5 }}>
                  Add or edit slides on the homepage. Each slide supports English & German badges, titles, subtitles, tags, and button text. You can toggle visibility, feature a slide, and drag/order slides.
                </p>
              </div>

              <div style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 0.5rem', color: 'var(--color-primary)' }}>2. Website Text (/content)</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.5 }}>
                  Side-by-side editing of German (DE) and English (EN) text across the Hero, About Preview, Vistex Features, Services, and Footers. Saving overrides the hardcoded defaults instantly.
                </p>
              </div>

              <div style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 0.5rem', color: 'var(--color-primary)' }}>3. Job Postings (/jobs)</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.5 }}>
                  Post open roles with department, location, work type (Remote / Hybrid / On-site). Includes optional German translations for job title, description, requirements, and benefits.
                </p>
              </div>

              <div style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 0.5rem', color: 'var(--color-primary)' }}>4. Blog Posts (/blogs)</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.5 }}>
                  Write and publish insights articles. Manage author, publication date, cover photo upload, summary, and full Markdown/HTML body. Visible on the site under <code>/insights</code>.
                </p>
              </div>

              <div style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 0.5rem', color: 'var(--color-primary)' }}>5. Links & Menus (/links)</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.5 }}>
                  Configure header navigation and footer quick links. Changes apply site-wide without needing code changes or redeploying frontends.
                </p>
              </div>

              <div style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 0.5rem', color: 'var(--color-primary)' }}>6. Media & Contact Info</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.5 }}>
                  Upload site logos, team imagery, and banners in <strong>Images</strong>. Update phone numbers, official addresses, and emails in <strong>Contact Info</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Forms & Resumes */}
      {activeTab === 'forms' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem', background: '#FFFFFF', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.75rem' }}>Forms Handling & Applications</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: '0 0 0.5rem' }}>Contact Inquiries (/enquiries)</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  Shows all contact submissions. Text is sanitized to prevent XSS. You can mark entries as reviewed or delete them.
                </p>
              </div>
              <div style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: '0 0 0.5rem' }}>Job Applications (/applications)</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  Candidates upload a PDF CV (up to 5 MB). The admin interface allows instant 1-click download of the candidate's original resume.
                </p>
              </div>
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Enabling Email Alerts (SMTP)</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: '0 0 1rem' }}>
              To receive instant email notifications whenever someone fills the contact form or applies for a job, configure SMTP in <code>/var/www/novasitara-api/.env</code> on your VPS:
            </p>
            <div style={{ position: 'relative' }}>
              <pre style={{ background: '#1E293B', color: '#F8FAFC', padding: '1rem', borderRadius: '8px', fontSize: '0.8125rem', overflowX: 'auto', fontFamily: 'monospace' }}>
{`SMTP_HOST=smtp.gmail.com   # Or your email provider
SMTP_PORT=465
SMTP_USER=info@novasitara.com
SMTP_PASS=your-app-password
SMTP_FROM="Nova Sitara" <info@novasitara.com>
MAIL_TO=info@novasitara.com
ADMIN_URL=https://admin.novasitara.com`}
              </pre>
              <button
                type="button"
                onClick={() => copyText('SMTP_HOST=smtp.gmail.com\nSMTP_PORT=465\nSMTP_USER=info@novasitara.com\nSMTP_PASS=\nSMTP_FROM="Nova Sitara" <info@novasitara.com>\nMAIL_TO=info@novasitara.com\nADMIN_URL=https://admin.novasitara.com', 'smtp')}
                style={{ position: 'absolute', top: '10px', right: '10px', background: '#334155', border: 'none', color: '#FFFFFF', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                {copiedKey === 'smtp' ? <Check size={14} /> : <Copy size={14} />}
                {copiedKey === 'smtp' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
              After editing, restart the API on the server: <code>systemctl restart novasitara-api</code>.
            </p>
          </div>
        </div>
      )}

      {/* Tab 4: Server Operations */}
      {activeTab === 'server' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem', background: '#FFFFFF', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>VPS Connection Details</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.875rem', background: '#F8FAFC', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>IP Address</div>
                <div style={{ fontSize: '1rem', fontWeight: 700 }}>103.135.230.42</div>
              </div>
              <div style={{ padding: '0.875rem', background: '#F8FAFC', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>SSH Port (Custom)</div>
                <div style={{ fontSize: '1rem', fontWeight: 700 }}>7576</div>
              </div>
              <div style={{ padding: '0.875rem', background: '#F8FAFC', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Default User</div>
                <div style={{ fontSize: '1rem', fontWeight: 700 }}>root</div>
              </div>
              <div style={{ padding: '0.875rem', background: '#F8FAFC', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Service Name</div>
                <div style={{ fontSize: '1rem', fontWeight: 700 }}>novasitara-api</div>
              </div>
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Essential Server Commands</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { title: 'SSH Login via Key', cmd: 'ssh -p 7576 -i ~/.ssh/novasitara_vps root@103.135.230.42' },
                { title: 'Check Backend Status', cmd: 'systemctl status novasitara-api' },
                { title: 'Restart Backend', cmd: 'systemctl restart novasitara-api' },
                { title: 'Stream Live Logs', cmd: 'journalctl -u novasitara-api -f' },
                { title: 'Test Nginx Syntax', cmd: 'nginx -t && systemctl reload nginx' },
                { title: 'Create / Reset Admin User', cmd: 'cd /var/www/novasitara-api && sudo -H -u novasitara npm run create-admin -- admin@novasitara.com "password"' },
              ].map((item, idx) => (
                <div key={item.title} style={{ background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{item.title}</span>
                    <button
                      type="button"
                      onClick={() => copyText(item.cmd, `srv-${idx}`)}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: copiedKey === `srv-${idx}` ? '#10B981' : 'var(--color-text-muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      {copiedKey === `srv-${idx}` ? <Check size={14} /> : <Copy size={14} />}
                      {copiedKey === `srv-${idx}` ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <code style={{ fontSize: '0.8125rem', color: '#0F172A', background: '#E2E8F0', padding: '0.2rem 0.5rem', borderRadius: '4px', display: 'block', overflowX: 'auto' }}>
                    {item.cmd}
                  </code>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Backups & Restoration */}
      {activeTab === 'backups' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem', background: '#FFFFFF', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>Backup Architecture</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: '0 0 1rem' }}>
              Your server creates compressed snapshots daily at 02:30 AM via cron job into <code>/var/backups/novasitara</code>:
            </p>
            <ul style={{ margin: '0 0 1.5rem 1.25rem', fontSize: '0.875rem', color: 'var(--color-text)', lineHeight: 1.6 }}>
              <li><strong>Database:</strong> <code>db-YYYY-MM-DD.dump</code> (custom PostgreSQL binary format with indexes and schemas).</li>
              <li><strong>Uploaded Media:</strong> <code>files-YYYY-MM-DD.tar.gz</code> (all uploaded candidate resumes and website images).</li>
              <li><strong>Retention:</strong> Rolling 14-day history is maintained automatically.</li>
            </ul>

            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Full System Restoration Instructions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { step: '1. Stop the application', cmd: 'systemctl stop novasitara-api' },
                { step: '2. Restore Database Dump', cmd: 'runuser -u postgres -- pg_restore --clean --if-exists -d novasitara /var/backups/novasitara/db-YYYY-MM-DD.dump' },
                { step: '3. Restore Uploaded Files', cmd: 'tar -xzf /var/backups/novasitara/files-YYYY-MM-DD.tar.gz -C /var/lib/novasitara && chown -R novasitara:novasitara /var/lib/novasitara' },
                { step: '4. Restart Service', cmd: 'systemctl start novasitara-api' },
              ].map((s, idx) => (
                <div key={s.step} style={{ background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{s.step}</span>
                    <button
                      type="button"
                      onClick={() => copyText(s.cmd, `rst-${idx}`)}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: copiedKey === `rst-${idx}` ? '#10B981' : 'var(--color-text-muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      {copiedKey === `rst-${idx}` ? <Check size={14} /> : <Copy size={14} />}
                      {copiedKey === `rst-${idx}` ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <pre style={{ margin: 0, background: '#1E293B', color: '#F8FAFC', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.8125rem', fontFamily: 'monospace' }}>
                    {s.cmd}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Local Development */}
      {activeTab === 'dev' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem', background: '#FFFFFF', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.75rem' }}>Running the Entire Stack Locally</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: '0 0 1.25rem' }}>
              Run the backend first, then both frontends in separate terminals:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>Terminal 1: Backend API (port 3000)</div>
                <pre style={{ margin: 0, background: '#1E293B', color: '#F8FAFC', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8125rem', fontFamily: 'monospace' }}>
{`cd novasitara-api
npm install
npm run start:dev    # http://localhost:3000/api`}
                </pre>
              </div>

              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>Terminal 2: Main Website (port 5173)</div>
                <pre style={{ margin: 0, background: '#1E293B', color: '#F8FAFC', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8125rem', fontFamily: 'monospace' }}>
{`cd novasitara
npm install
npm run dev          # http://localhost:5173`}
                </pre>
              </div>

              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>Terminal 3: Admin Panel (port 5174)</div>
                <pre style={{ margin: 0, background: '#1E293B', color: '#F8FAFC', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8125rem', fontFamily: 'monospace' }}>
{`cd novasitara-admin
npm install
npm run dev          # http://localhost:5174`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
