import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('library-token')));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('library-token')) {
      return;
    }

    api('/auth/me')
      .then(({ user: currentUser }) => setUser(currentUser))
      .catch((requestError) => {
        if (requestError.status === 401) {
          localStorage.removeItem('library-token');
          setUser(null);
          return;
        }
        setError(requestError.message);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(credentials, register = false) {
    setError('');
    const endpoint = register ? '/auth/register' : '/auth/login';
    const result = await api(endpoint, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    localStorage.setItem('library-token', result.token);
    setUser(result.user);
    return result.user;
  }

  function logout() {
    localStorage.removeItem('library-token');
    setUser(null);
    setError('');
  }

  const value = useMemo(
    () => ({ user, loading, error, login, logout }),
    [user, loading, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }
  return context;
}
