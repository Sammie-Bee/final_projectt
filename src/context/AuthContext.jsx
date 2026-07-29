import { createContext, useContext, useMemo, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const AUTH_TOKEN_KEY = 'northstar_token';
const AUTH_USER_KEY = 'northstar_user';
const ACCOUNT_NUMBER_PREFIX = 'northstar_account_';

const createAccountNumber = () => String(1000000000 + Math.floor(Math.random() * 9000000000));

const OWNER_EMAIL = 'owner@northstar.com';
const OWNER_PASSWORD = 'Owner123!';

const getStoredAccountNumber = (email) => {
  if (typeof window === 'undefined') {
    return null;
  }

  const normalizedEmail = (email || '').trim().toLowerCase();
  return normalizedEmail ? window.localStorage.getItem(`${ACCOUNT_NUMBER_PREFIX}${normalizedEmail}`) : null;
};

const persistAccountNumber = (email, accountNumber) => {
  if (typeof window === 'undefined' || !accountNumber) {
    return;
  }

  const normalizedEmail = (email || '').trim().toLowerCase();
  if (!normalizedEmail) {
    return;
  }

  window.localStorage.setItem(`${ACCOUNT_NUMBER_PREFIX}${normalizedEmail}`, accountNumber);
};

const resolveAccountNumber = (email, preferredAccountNumber) => {
  const storedAccountNumber = getStoredAccountNumber(email);
  const nextAccountNumber = preferredAccountNumber || storedAccountNumber || createAccountNumber();

  persistAccountNumber(email, nextAccountNumber);
  return nextAccountNumber;
};

const readStoredAuth = () => {
  if (typeof window === 'undefined') {
    return { user: null, token: null };
  }

  const savedUser = window.sessionStorage.getItem(AUTH_USER_KEY);
  const savedToken = window.sessionStorage.getItem(AUTH_TOKEN_KEY);

  return {
    user: savedUser ? JSON.parse(savedUser) : null,
    token: savedToken || null
  };
};

const persistAuth = (nextToken, nextUser) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem(AUTH_TOKEN_KEY, nextToken);
  window.sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser));
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
};

const clearAuthStorage = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.removeItem(AUTH_TOKEN_KEY);
  window.sessionStorage.removeItem(AUTH_USER_KEY);
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredAuth().user);
  const [token, setToken] = useState(() => readStoredAuth().token);
  const [loading, setLoading] = useState(false);

  const updateUser = (updates) => {
    setUser((current) => {
      const nextUser = { ...current, ...updates };
      persistAuth(token, nextUser);
      return nextUser;
    });
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, { email, password });
      const resolvedAccountNumber = resolveAccountNumber(email, data.user?.accountNumber);
      const nextUser = {
        id: data.user?.id || Date.now(),
        fullName: data.user?.fullName || 'Demo User',
        email: data.user?.email || email,
        role: data.user?.role || 'user',
        accountNumber: resolvedAccountNumber,
        balance: typeof data.user?.balance === 'number' ? data.user.balance : 0
      };
      const nextToken = data.token || 'demo-token';

      persistAuth(nextToken, nextUser);
      setToken(nextToken);
      setUser(nextUser);
      return nextUser;
    } catch (error) {
      const message = error.response?.data?.message || 'Unable to login right now.';
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName, email, password) => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/auth/register`, { fullName, email, password });
      const resolvedAccountNumber = resolveAccountNumber(email, data.user?.accountNumber);
      const nextUser = {
        id: data.user?.id || Date.now(),
        fullName: data.user?.fullName || fullName,
        email: data.user?.email || email,
        role: data.user?.role || 'user',
        accountNumber: resolvedAccountNumber,
        balance: typeof data.user?.balance === 'number' ? data.user.balance : 0
      };
      const nextToken = data.token || 'demo-token';

      persistAuth(nextToken, nextUser);
      setToken(nextToken);
      setUser(nextUser);
      return nextUser;
    } catch (error) {
      const message = error.response?.data?.message || 'Unable to register right now.';
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuthStorage();
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, updateUser, isAuthenticated: Boolean(user && token) }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
