import React from 'react';
import { useAuthState } from '../hooks/useAuth';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuthState();

  return (
    <auth.AuthContext.Provider value={auth}>
      {children}
    </auth.AuthContext.Provider>
  );
};