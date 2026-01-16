import { useState, useEffect } from 'react';
import { api } from '../lib/api';

/**
 * Hook to manage CSRF token
 * Fetches CSRF token on mount and provides it for requests
 */
export function useCsrf() {
  const [csrfToken, setCsrfToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchToken = async () => {
      try {
        setLoading(true);
        
        // Check sessionStorage first
        const storedToken = sessionStorage.getItem('csrfToken');
        if (storedToken) {
          setCsrfToken(storedToken);
          setLoading(false);
          return;
        }
        
        // Fetch new token from server
        const response = await api.get('/api/csrf-token');
        if (response.success && response.csrfToken) {
          setCsrfToken(response.csrfToken);
          sessionStorage.setItem('csrfToken', response.csrfToken);
        } else {
          throw new Error('Failed to get CSRF token');
        }
      } catch (err) {
        console.error('Failed to fetch CSRF token:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchToken();
  }, []);
  
  // Function to refresh token
  const refreshToken = async () => {
    sessionStorage.removeItem('csrfToken');
    setCsrfToken(null);
    setLoading(true);
    
    try {
      const response = await api.get('/api/csrf-token');
      if (response.success && response.csrfToken) {
        setCsrfToken(response.csrfToken);
        sessionStorage.setItem('csrfToken', response.csrfToken);
      }
    } catch (err) {
      console.error('Failed to refresh CSRF token:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return { csrfToken, loading, error, refreshToken };
}

/**
 * Get CSRF token from sessionStorage or fetch new one
 * Use this for direct access without hook
 */
export async function getCsrfToken() {
  // Check sessionStorage first
  const stored = sessionStorage.getItem('csrfToken');
  if (stored) return stored;
  
  // Fetch new token if not in storage
  try {
    const { api } = await import('../lib/api');
    const response = await api.get('/api/csrf-token');
    if (response.success && response.csrfToken) {
      sessionStorage.setItem('csrfToken', response.csrfToken);
      return response.csrfToken;
    }
  } catch (err) {
    console.error('Failed to fetch CSRF token:', err);
  }
  return null;
}

/**
 * Set CSRF token in sessionStorage
 */
export function setCsrfTokenStorage(token) {
  if (token) {
    sessionStorage.setItem('csrfToken', token);
  } else {
    sessionStorage.removeItem('csrfToken');
  }
}
