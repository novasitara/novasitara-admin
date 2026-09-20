import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { Logo } from './Logo';
import { LayoutDashboard, Briefcase, FileText, MessageSquare, LogOut, Menu } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, end: true },
  { label: 'Jobs', path: '/jobs', icon: Briefcase },
  { label: 'Applications', path: '/applications', icon: FileText },
  { label: 'Enquiries', path: '/enquiries', icon: MessageSquare },
];

const Sidebar: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { user, signOut } = useAdminAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <aside style={{ width: '240px', minHeight: '100vh', backgroundColor: '#0A0A0E', display: 'flex', flexDirection: 'column', borderRight: '1px solid #1F1F28', flexShrink: 0 }}>
      <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid #1F1F28' }}>
        <Logo variant="dark" height={34} />
        <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-primary)' }}>Admin Panel</div>
      </div>

      <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        {navItems.map(({ label, path, icon: Icon, end }) => (
          <NavLink key={path} to={path} end={end} onClick={onClose}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem', fontWeight: isActive ? 700 : 500,
              color: isActive ? '#FFFFFF' : '#A0A0B0',
              backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
              transition: 'all 150ms ease', textDecoration: 'none',
            })}
          >
            <Icon size={17} />{label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid #1F1F28' }}>
        <div style={{ fontSize: '0.775rem', color: '#505060', padding: '0 0.85rem', marginBottom: '0.65rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
        <button onClick={handleSignOut}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', fontWeight: 500, color: '#A0A0B0', transition: 'all 150ms ease' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; (e.currentTarget as HTMLElement).style.backgroundColor = '#1F1F28'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#A0A0B0'; (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
        >
          <LogOut size={17} /> Sign Out
        </button>
      </div>
    </aside>
  );
};

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Desktop sidebar */}
      <div className="sidebar-desktop"><Sidebar /></div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)' }} onClick={() => setSidebarOpen(false)} />
          <div style={{ position: 'relative', zIndex: 1 }}><Sidebar onClose={() => setSidebarOpen(false)} /></div>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Mobile topbar */}
        <div className="topbar-mobile" style={{ display: 'none', alignItems: 'center', gap: '1rem', padding: '0.9rem 1.25rem', backgroundColor: '#0A0A0E', borderBottom: '1px solid #1F1F28' }}>
          <button onClick={() => setSidebarOpen(true)} style={{ color: '#fff', display: 'flex' }}><Menu size={22} /></button>
          <Logo variant="dark" height={30} />
        </div>

        <main style={{ flex: 1, padding: 'clamp(1.5rem, 3vw, 2.5rem)', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        .sidebar-desktop { display: flex; }
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          .topbar-mobile { display: flex !important; }
        }
      `}</style>
    </div>
  );
};
