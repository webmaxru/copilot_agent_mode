import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { API_BASE_URL, api } from '../api/config';

export interface CurrentUser {
  userId: number;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  isAdmin: boolean;
  currentUser: CurrentUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateCurrentUser: (updates: Partial<Pick<CurrentUser, 'name'>>) => void;
}

const AUTH_STORAGE_KEY = 'octocat_user';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? (JSON.parse(stored) as CurrentUser) : null;
    } catch {
      return null;
    }
  });

  const isLoggedIn = currentUser !== null;
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [currentUser]);

  const login = async (email: string, password: string) => {
    const response = await axios.post<CurrentUser>(
      `${API_BASE_URL}${api.endpoints.users}/login`,
      { email, password },
    );
    setCurrentUser(response.data);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateCurrentUser = (updates: Partial<Pick<CurrentUser, 'name'>>) => {
    setCurrentUser((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isAdmin, currentUser, login, logout, updateCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
