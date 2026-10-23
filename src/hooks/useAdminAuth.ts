import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export interface AdminUser { email: string }

export function useAdminAuth() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // The session lives in an httpOnly cookie; the server tells us who is signed in.
    api<AdminUser>('/auth/me')
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const signIn = async (email: string, password: string): Promise<Error | null> => {
    try {
      setUser(await api<AdminUser>('/auth/login', { body: { email, password } }));
      return null;
    } catch (e) {
      return e instanceof Error ? e : new Error('Sign in failed');
    }
  };

  const signOut = async () => {
    await api('/auth/logout', { method: 'POST' }).catch(() => undefined);
    setUser(null);
  };

  return { user, loading, signIn, signOut };
}
