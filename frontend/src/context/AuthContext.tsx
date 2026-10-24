import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUserInState: (updated: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('jeevalink_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      const data = await api.get<{ success: boolean; user: User }>('/auth/me');
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
      localStorage.removeItem('jeevalink_token');
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await api.post<{ success: boolean; message: string; token: string; user: User }>(
        '/auth/login',
        { email, password }
      );
      if (data.success && data.user) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('jeevalink_token', data.token);
        toast.success(`Welcome back, ${data.user.name}!`);
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error(error.message || 'Login failed. Please check your credentials.');
      return false;
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      const data = await api.post<{ success: boolean; message: string; token: string; user: User }>(
        '/auth/register',
        userData
      );
      if (data.success && data.user) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('jeevalink_token', data.token);
        toast.success(data.message || 'Registration successful!');
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error(error.message || 'Registration failed. Please check your details.');
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Continue client cleanup even if logout network call fails
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('jeevalink_token');
      toast.success('Logged out successfully');
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const updateUserInState = (updated: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updated } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        updateUserInState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
