import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import api, { setAuthToken } from '../utils/api';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const { isSignedIn, getToken } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchUserData = useCallback(async () => {
    if (!isSignedIn) {
      setUserData(null);
      return;
    }
    try {
      setLoading(true);
      const token = await getToken();
      setAuthToken(token);
      const { data } = await api.get('/api/user/credits');
      setUserData(data);
    } catch (err) {
      console.error('Failed to fetch user data:', err);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, getToken]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const refreshUser = () => fetchUserData();

  return (
    <UserContext.Provider value={{ userData, loading, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
};
