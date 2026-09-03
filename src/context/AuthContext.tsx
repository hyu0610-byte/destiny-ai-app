import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  getCachedUser,
  fetchCurrentUser,
  register as registerUser,
  login as loginUser,
  logout as logoutUser,
  type AuthUser,
} from '../lib/auth';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getCachedUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchCurrentUser().then((current) => {
      if (active) {
        setUser(current);
        setLoading(false);
      }
    });

    const sync = () => setUser(getCachedUser());
    window.addEventListener('destiny-ai:auth-changed', sync);
    window.addEventListener('storage', sync);
    return () => {
      active = false;
      window.removeEventListener('destiny-ai:auth-changed', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    register: async (email, password) => {
      const next = await registerUser(email, password);
      setUser(next);
    },
    login: async (email, password) => {
      const next = await loginUser(email, password);
      setUser(next);
    },
    logout: () => {
      logoutUser();
      setUser(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
