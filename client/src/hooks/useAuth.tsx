import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

type User = { id: string; fullName: string; email: string; role: 'ADMIN' | 'USER' };

type AuthCtx = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx>(null as any);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // nạp từ localStorage và xác thực lại với /auth/me
  useEffect(() => {
    const t = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    if (t && u) {
      setToken(t);
      try {
        setUser(JSON.parse(u));
      } catch {}
      // gọi /me để làm mới thông tin (không bắt buộc)
      api.get('/auth/me').then(r => {
        setUser(r.data);
        localStorage.setItem('user', JSON.stringify(r.data));
      }).catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
      });
    }
  }, []);

  async function login(email: string, password: string) {
    // đảm bảo body đúng định dạng cho Zod server
    const { data } = await api.post('/auth/login', { email, password });
    setToken(data.token);
    setUser(data.user as User);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data.user as User;
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  }

  const value = useMemo(() => ({ user, token, login, logout }), [user, token]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
