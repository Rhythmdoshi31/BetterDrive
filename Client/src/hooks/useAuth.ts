// hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { getCookieValue } from '../utils/cookieHelper';
import type { User, AuthHookReturn } from '../types/auth';

export const useAuth = (): AuthHookReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // ✅ Memoize logout function to prevent recreating on every render
  const logout = useCallback(async (): Promise<void> => {
    try {
      localStorage.removeItem('betterdrive_user');
      
      await fetch('http://localhost:3000/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []); // Empty dependency array since logout doesn't depend on any state

  // ✅ Memoize checkAuthStatus too
  const checkAuthStatus = useCallback((): void => {
    setLoading(true);
    
    const savedUser = localStorage.getItem('betterdrive_user');
    if (savedUser) {
      try {
        const userData: User = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(userData.isAuthenticated || false);
        setLoading(false);
        return;
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('betterdrive_user');
      }
    }

    const userCookie: User | null = getCookieValue('user_data');
    if (userCookie) {
      setUser(userCookie);
      setIsAuthenticated(userCookie.isAuthenticated || false);
      localStorage.setItem('betterdrive_user', JSON.stringify(userCookie));
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    user,
    isAuthenticated,
    loading,
    logout,
    checkAuthStatus
  };
};
