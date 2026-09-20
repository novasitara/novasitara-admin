import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Briefcase, FileText, MessageSquare, TrendingUp } from 'lucide-react';

interface Stats { jobs: number; applications: number; newApplications: number; enquiries: number; newEnquiries: number; }

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({ jobs: 0, applications: 0, newApplications: 0, enquiries: 0, newEnquiries: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('applications').select('id', { count: 'exact', head: true }),
      supabase.from('applications').select('id', { count: 'exact', head: true }).eq('status', 'new'),
      supabase.from('enquiries').select('id', { count: 'exact', head: true }),
      supabase.from('enquiries').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    ]).then(([jobs, apps, newApps, enqs, newEnqs]) => {
      setStats({ jobs: jobs.count ?? 0, applications: apps.count ?? 0, newApplications: newApps.count ?? 0, enquiries: enqs.count ?? 0, newEnquiries: newEnqs.count ?? 0 });
      setLoading(false);
    });
  }, []);

  const cards = [
    { label: 'Active Jobs', value: stats.jobs, sub: 'Live listings', icon: Briefcase, color: 'var(--color-primary)', link: '/jobs' },
    { label: 'Total Applications', value: stats.applications, sub: `${stats.newApplications} new`, icon: FileText, color: '#10B981', link: '/applications' },
    { label: 'Total Enquiries', value: stats.enquiries, sub: `${stats.newEnquiries} new`, icon: MessageSquare, color: '#F59E0B', link: '/enquiries' },
    { label: 'Conversion', value: '—', sub: 'Track via enquiries', icon: TrendingUp, color: '#6366F1', link: '/enquiries' },
  ];

  const quickActions = [
    { label: '+ Add New Job', link: '/jobs/new' },
    { label: 'View New Applications', link: '/applications' },
    { label: 'View New Enquiries', link: '/enquiries' },
    { label: 'Edit Site Content', link: '/content' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <div className="eyebrow">Overview</div>
        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>Dashboard</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {cards.map(({ label, value, sub, icon: Icon, color, link }) => (
          <Link key={label} to={link} style={{ textDecoration: 'none' }}>
            <div
              style={{ backgroundColor: '#fff', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', transition: 'box-shadow 200ms, transform 200ms' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>{label}</span>
                <div style={{ width: '34px', height: '34px', borderRadius: 'var(--radius-md)', backgroundColor: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={17} color={color} />
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text-heading)', letterSpacing: '-0.03em', lineHeight: 1 }}>{loading ? '—' : value}</div>
              <div style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>{sub}</div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ backgroundColor: '#fff', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Quick Actions</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
          {quickActions.map(({ label, link }) => (
            <Link key={label} to={link}
              style={{ padding: '0.55rem 1.1rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-heading)', backgroundColor: 'var(--color-bg-subtle)', transition: 'border-color 150ms' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'}
            >{label}</Link>
          ))}
        </div>
      </div>
    </div>
  );
};
