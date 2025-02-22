import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as authLogin, logout as authLogout, getStoredAuth } from '../services/authService';
import type User from '@/types/user.types';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<User>;
  logout: () => void;
  clearError: () => void;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Check for stored auth data on mount
    const storedAuth = getStoredAuth();
    if (storedAuth) {
      setState({
        isAuthenticated: true,
        user: storedAuth.user,
        loading: false,
        error: null,
      });
    } else {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const login = async (username: string, password: string): Promise<User> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const authData = await authLogin({ username, password });
      const user: User = {
        ...authData.user,
        followers: [],
        following: [],
        accounts: [],
        strategies: [],
        performance: {
          winRate: 0,
          totalPnL: 0,
          monthlyReturn: 0,
          totalTrades: 0,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setState({
        isAuthenticated: true,
        user,
        loading: false,
        error: null,
      });
      return user;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      }));
      throw error;
    }
  };

  const logout = () => {
    authLogout();
    setState({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,
    });
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const updateUser = (updatedUser: User) => {
    if (state.user && state.user.id === updatedUser.id) {
      // Update localStorage
      const storedAuth = getStoredAuth();
      if (storedAuth) {
        localStorage.setItem(
          'auth',
          JSON.stringify({
            ...storedAuth,
            user: updatedUser,
          })
        );
      }

      // Update state
      setState(prev => ({
        ...prev,
        user: updatedUser,
      }));
    }
  };

  const value = {
    ...state,
    login,
    logout,
    clearError,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
