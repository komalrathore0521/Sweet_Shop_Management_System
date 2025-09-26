import { useState, useEffect, createContext, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  username: string;
  role: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const decodeToken = (token: string): User | null => {
  try {
    const decoded: any = jwtDecode(token);
    return {
      id: decoded.sub || decoded.username,
      username: decoded.sub || decoded.username,
      role: decoded.role || 'ROLE_USER',
      email: decoded.email,
    };
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};
export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const decodedUser = decodeToken(token);
        if (decodedUser) {
          setUser(decodedUser);
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        localStorage.removeItem('token');
      }
    }

    setLoading(false);
  }, []);

  const login = (token: string, userData?: User) => {
    localStorage.setItem('token', token);
    
    if (userData) {
      setUser(userData);
    } else {
      const decodedUser = decodeToken(token);
      setUser(decodedUser);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const isAdmin = user?.role === 'ROLE_ADMIN';

  return {
    user,
    loading,
    isAdmin,
    login,
    logout,
    AuthContext,
  };
};