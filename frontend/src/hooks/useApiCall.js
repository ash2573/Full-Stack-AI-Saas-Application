import { useAuth } from '@clerk/clerk-react';
import { useCallback } from 'react';
import api, { setAuthToken } from '../utils/api';

export const useApiCall = () => {
  const { getToken } = useAuth();

  const callApi = useCallback(
    async (method, url, data = null, config = {}) => {
      const token = await getToken();
      setAuthToken(token);

      const response = await api({
        method,
        url,
        data,
        ...config,
      });

      return response.data;
    },
    [getToken]
  );

  return { callApi };
};
