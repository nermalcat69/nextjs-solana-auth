'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface SessionContextType {
  isAuthenticated: boolean;
  address: string | null;
  token: string | null;
  login: (address: string, token: string) => void;
  logout: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('solana_auth_token');
    const storedAddress = localStorage.getItem('solana_auth_address');
    
    if (storedToken && storedAddress) {
      // Verify token is still valid
      fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedToken}`,
        },
      })
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          setToken(storedToken);
          setAddress(storedAddress);
          setIsAuthenticated(true);
        } else {
          // Clear invalid session
          localStorage.removeItem('solana_auth_token');
          localStorage.removeItem('solana_auth_address');
        }
      })
      .catch(() => {
        // Clear session on error
        localStorage.removeItem('solana_auth_token');
        localStorage.removeItem('solana_auth_address');
      });
    }
  }, []);

  const login = (userAddress: string, userToken: string) => {
    setAddress(userAddress);
    setToken(userToken);
    setIsAuthenticated(true);
    localStorage.setItem('solana_auth_token', userToken);
    localStorage.setItem('solana_auth_address', userAddress);
  };

  const logout = () => {
    setAddress(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('solana_auth_token');
    localStorage.removeItem('solana_auth_address');
  };

  return (
    <SessionContext.Provider value={{
      isAuthenticated,
      address,
      token,
      login,
      logout,
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}