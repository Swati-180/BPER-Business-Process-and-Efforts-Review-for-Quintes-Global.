import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: string;
  status?: string;
  department?: string;
  tower?: string;
  grade?: string;
}

interface DecodedToken {
  userId: string;
  exp?: number;
  iat?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');

        if (!storedToken) {
          setIsLoading(false);
          return;
        }

        // Verify token is not expired
        try {
          const decoded = jwtDecode<DecodedToken>(storedToken);
          const currentTime = Math.floor(Date.now() / 1000);

          if (decoded.exp && decoded.exp < currentTime) {
            // Token expired
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setIsLoading(false);
            return;
          }
        } catch (decodeError) {
          // Invalid token format
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsLoading(false);
          return;
        }

        // Set token immediately
        setToken(storedToken);

        // Verify with backend
        try {
          const response = await api.get('/api/auth/me');
          const userData = response.data;

          setUser({
            ...userData,
            id: userData._id || userData.id,
          });
          setToken(storedToken);
        } catch (error) {
          // Failed to verify - clear auth
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser({
      ...newUser,
      id: newUser._id || newUser.id,
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
