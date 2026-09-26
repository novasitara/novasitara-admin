import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { Button } from '../components/Button';
import { Logo } from '../components/Logo';
import { Lock, Mail, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { signIn } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const err = await signIn(email, password);
    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <Logo height={44} />
          <p className="login-logo-subtitle">Admin Panel — Sign in to continue</p>
        </div>

        <div className="login-form-card">
          <h2 className="login-title">Sign In</h2>

          {error && (
            <div className="login-error">
              <AlertCircle size={15} />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div>
              <label className="label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} className="input-icon" />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@novasitara.com" className="input input-with-icon" />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} className="input-icon" />
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="input input-with-icon" />
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" isLoading={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
              Sign In to Admin
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
