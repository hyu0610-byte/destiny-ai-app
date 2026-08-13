import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getCurrentUser, login as loginUser, logout as logoutUser, type MockUser } from '../lib/auth';

interface AuthContextValue {
  user: MockUser | null;
  login: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(() => getCurrentUser());

  useEffect(() => {
    const sync = () => setUser(getCurrentUser());
    window.addEventListener('destiny-ai:auth-changed', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('destiny-ai:auth-changed', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const value: AuthContextValue = {
    user,
    login: (email: string) => {
      loginUser(email);
      setUser(getCurrentUser());
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
