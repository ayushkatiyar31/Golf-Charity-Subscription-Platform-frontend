import { createContext, useEffect, useState } from 'react';
import { authService } from '../services';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('golf-charity-token');
    if (!token) {
      setLoading(false);
      return;
    }

    authService
      .me()
      .then(({ data }) => setUser(data))
      .catch(() => {
        localStorage.removeItem('golf-charity-token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (payload) => {
    const { data } = await authService.login(payload);
    localStorage.setItem('golf-charity-token', data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await authService.register(payload);
    localStorage.setItem('golf-charity-token', data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem('golf-charity-token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, isAdmin: user?.role === 'admin', login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
