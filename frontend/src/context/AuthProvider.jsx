import { useState, useCallback } from 'react';
import AuthContext from './AuthContext';
import { authApi } from '../api/auth';
import {
  storeTokens,
  clearStoredTokens,
  getStoredUser,
  getStoredTokens,
} from '../api/axiosClient';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());

  const login = useCallback(async (email, password) => {
    const data = await authApi.login({ email, password });
    storeTokens(data);
    const userData = { id: data.userId, email: data.email, name: data.name, role: data.role };
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (formData) => {
    const data = await authApi.register(formData);
    storeTokens(data);
    const userData = { id: data.userId, email: data.email, name: data.name, role: data.role };
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(async () => {
    const tokens = getStoredTokens();
    if (tokens?.refreshToken) {
      try {
        await authApi.logout(tokens.refreshToken);
      } catch {
        // Ignore errors on logout
      }
    }
    clearStoredTokens();
    setUser(null);
  }, []);

  const forgotPassword = useCallback(async (email) => {
    return authApi.forgotPassword(email);
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    role: user?.role ?? null,
    login,
    register,
    logout,
    forgotPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
