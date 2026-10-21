import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAdminAuth } from './hooks/useAdminAuth';
import { AdminLayout } from './components/AdminLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Jobs } from './pages/Jobs';
import { JobForm } from './pages/JobForm';
import { Applications } from './pages/Applications';
import { Enquiries } from './pages/Enquiries';
import { ContentText } from './pages/ContentText';
import { ContactInfo } from './pages/ContactInfo';
import { Images } from './pages/Images';
import { Blogs } from './pages/Blogs';
import { BlogForm } from './pages/BlogForm';
import { Links } from './pages/Links';
import './styles/index.css';
import './styles/components.css';

const Protected: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isAdmin, signOut } = useAdminAuth();
  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (isAdmin === false) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', fontFamily: 'var(--font-sans)', padding: '1.5rem', textAlign: 'center' }}>
        <h2>No admin access</h2>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: '420px' }}>{user.email} is not on the approved admin list. Ask the site owner to add this email, then sign in again.</p>
        <button className="btn btn-outline btn-md" onClick={() => signOut()}>Sign out</button>
      </div>
    );
  }
  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Protected><AdminLayout /></Protected>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="jobs/new" element={<JobForm />} />
          <Route path="jobs/:id/edit" element={<JobForm />} />
          <Route path="applications" element={<Applications />} />
          <Route path="enquiries" element={<Enquiries />} />
          <Route path="content" element={<ContentText />} />
          <Route path="contact-info" element={<ContactInfo />} />
          <Route path="images" element={<Images />} />
          <Route path="blogs" element={<Blogs />} />
          <Route path="blogs/new" element={<BlogForm />} />
          <Route path="blogs/:id/edit" element={<BlogForm />} />
          <Route path="links" element={<Links />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
