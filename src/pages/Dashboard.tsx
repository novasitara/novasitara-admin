import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Briefcase, FileText, MessageSquare, TrendingUp, Plus, Eye, Mail, Edit3 } from 'lucide-react';

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const cards = [
    { label: 'Active Jobs', value: stats.jobs, sub: 'Live listings', icon: Briefcase, color: 'var(--color-primary)', bg: 'var(--color-primary-light)', link: '/jobs' },
    { label: 'Total Applications', value: stats.applications, sub: `${stats.newApplications} new`, icon: FileText, color: '#10B981', bg: '#ECFDF5', link: '/applications' },
    { label: 'Total Enquiries', value: stats.enquiries, sub: `${stats.newEnquiries} new`, icon: MessageSquare, color: '#F59E0B', bg: '#FFFBEB', link: '/enquiries' },
    { label: 'Conversion', value: '—', sub: 'Track via enquiries', icon: TrendingUp, color: '#6366F1', bg: '#EEF2FF', link: '/enquiries' },
  ];

  const quickActions = [
    { label: 'Add New Job', icon: Plus, link: '/jobs/new' },
    { label: 'View Applications', icon: Eye, link: '/applications' },
    { label: 'View Enquiries', icon: Mail, link: '/enquiries' },
    { label: 'Edit Site Content', icon: Edit3, link: '/content' },
  ];

  return (
    <div className="fade-in">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-title">{getGreeting()} 👋</div>
        <div className="welcome-subtitle">Here's what's happening with your admin panel today</div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton skeleton-card" />
          ))
        ) : (
          cards.map(({ label, value, sub, icon: Icon, color, bg, link }) => (
            <Link key={label} to={link} className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">{label}</span>
                <div className="stat-card-icon" style={{ backgroundColor: bg }}>
                  <Icon size={18} color={color} />
                </div>
              </div>
              <div className="stat-card-value">{value}</div>
              <div className="stat-card-sub">{sub}</div>
            </Link>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-body">
          <h3 className="section-title">Quick Actions</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
            {quickActions.map(({ label, icon: Icon, link }) => (
              <Link key={label} to={link} className="quick-action">
                <div className="quick-action-icon">
                  <Icon size={15} />
                </div>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
