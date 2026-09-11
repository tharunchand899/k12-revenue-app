import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
 const [user, setUser] = useState(() => {
   const saved = localStorage.getItem("k12_user");
   // Safely check that it's not the string "undefined" before parsing
   return saved && saved !== "undefined" ? JSON.parse(saved) : null;
 });
  const [token, setToken] = useState(() => localStorage.getItem('k12_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          localStorage.setItem('k12_user', JSON.stringify(res.data.user));
        } catch (err) {
          console.error('Failed to verify token', err);
          logout();
        }
      }
      setLoading(false);
    };
    verifyUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: newUser } = res.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('k12_token', newToken);
    localStorage.setItem('k12_user', JSON.stringify(newUser));
    return newUser;
  };

  const register = async (userData) => {
    const res = await api.post("/auth/register", userData);

    // Safely extract data, falling back to undefined if missing
    const newToken = res.data?.token;
    const newUser = res.data?.user;

    // Only set token if it exists
    if (newToken) {
      setToken(newToken);
      localStorage.setItem("k12_token", newToken);
    }

    // Only set user if it exists
    if (newUser) {
      setUser(newUser);
      localStorage.setItem("k12_user", JSON.stringify(newUser));
    } else {
      // Log to help you debug what the backend is actually returning
      console.warn(
        "Registration successful, but no user object returned:",
        res.data,
      );
    }

    return newUser;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('k12_token');
    localStorage.removeItem('k12_user');
  };

  // Demo role switcher helper for quick evaluator switching
  const switchDemoRole = async (targetRole) => {
    const demoCredentials = {
      'Admin': { email: 'admin@school.org', pass: 'Admin123!' },
      'Executive': { email: 'executive@school.org', pass: 'Executive123!' },
      'Finance Controller': { email: 'finance@school.org', pass: 'Finance123!' },
      'Pricing Manager': { email: 'pricing@school.org', pass: 'Pricing123!' },
      'Sales User': { email: 'sales@school.org', pass: 'Sales123!' },
    };
    const cred = demoCredentials[targetRole];
    if (cred) {
      await login(cred.email, cred.pass);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, switchDemoRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
