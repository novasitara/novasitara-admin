import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { Logo } from './Logo';
import { LayoutDashboard, Briefcase, FileText, MessageSquare, LogOut, Menu, Search, Bell } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, end: true },
  { label: 'Jobs', path: '/jobs', icon: Briefcase },
  { label: 'Applications', path: '/applications', icon: FileText },
  { label: 'Enquiries', path: '/enquiries', icon: MessageSquare },
];

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/jobs': 'Jobs',
  '/jobs/new': 'Add New Job',
  '/applications': 'Applications',
  '/enquiries': 'Enquiries',
};

const Sidebar: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { user, signOut } = useAdminAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Logo variant="dark" height={34} />
        <div className="sidebar-label">Admin Panel</div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ label, path, icon: Icon, end }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            onClick={onClose}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={17} />{label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-email">{user?.email}</div>
        <button onClick={handleSignOut} className="sidebar-signout">
          <LogOut size={17} /> Sign Out
        </button>
      </div>
    </aside>
  );
};

const TopBar: React.FC = () => {
  const location = useLocation();
  const { user } = useAdminAuth();
  const currentTitle = pageTitles[location.pathname] || 'Admin';
  const initials = user?.email?.charAt(0).toUpperCase() || 'A';

  return (
    <div className="topbar">
      <div className="topbar-title">{currentTitle}</div>
      <div className="topbar-actions">
        <div className="topbar-search">
          <Search size={14} />
          <span>Search...</span>
        </div>
        <button className="topbar-icon-btn">
          <Bell size={18} />
          <span className="topbar-notification-dot"></span>
        </button>
        <div className="avatar avatar-sm avatar-primary">{initials}</div>
      </div>
    </div>
  );
};

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-layout">
      {/* Desktop sidebar */}
      <div className="sidebar-desktop"><Sidebar /></div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="mobile-overlay">
          <div className="mobile-overlay-bg" onClick={() => setSidebarOpen(false)} />
          <div className="mobile-overlay-content">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="admin-content-wrapper">
        {/* Mobile topbar */}
        <div className="topbar-mobile-bar">
          <button onClick={() => setSidebarOpen(true)} className="topbar-mobile-btn">
            <Menu size={22} />
          </button>
          <Logo variant="dark" height={30} />
        </div>

        {/* Desktop topbar */}
        <TopBar />

        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
