// src/auth/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth as useOidcAuth } from 'react-oidc-context';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const oidcAuth = useOidcAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (oidcAuth.isLoading) {
      setIsLoading(true);
      return;
    }

    if (oidcAuth.isAuthenticated && oidcAuth.user) {
      const email = oidcAuth.user.profile.email;
      const verifySubscription = async () => {
        setIsLoading(true);
        if (window.location.hostname === 'localhost') {
          setIsAuthenticated(true);
          setUser({ email, customerId: 'dev-customer-id', subscriptionId: 'dev-subscription-id' });
          setIsLoading(false);
          return;
        }

        try {
          const response = await fetch('https://1w8huooby5.execute-api.ap-southeast-2.amazonaws.com/prod/verify-subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });

          const data = await response.json();

          if (data.active) {
            setIsAuthenticated(true);
            setUser({ email, customerId: data.customerId, subscriptionId: data.subscriptionId });
          } else {
            oidcAuth.removeUser();
            setIsAuthenticated(false);
            setUser(null);
            setError('No active subscription found for this email.');
          }
        } catch (error) {
          console.error('Auth verification failed:', error);
          setIsAuthenticated(false);
          setUser(null);
          setError('Authentication verification failed.');
        } finally {
          setIsLoading(false);
        }
      };

      verifySubscription();
    } else {
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
    }
  }, [oidcAuth.isAuthenticated, oidcAuth.isLoading, oidcAuth.user]);

  const login = () => {
    setError(null);
    oidcAuth.signinRedirect();
  };

  const logout = () => {
    // Local state cleanup
    setIsAuthenticated(false);
    setUser(null);

    // Remove OIDC user
    if (oidcAuth && typeof oidcAuth.removeUser === 'function') {
      oidcAuth.removeUser();
    }

    // Clear memory state and cookies
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear cookies
    document.cookie.split(';').forEach((cookie) => {
      document.cookie = cookie.split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;';
    });
    
    // Force a complete page reload (bypass cache)
    window.location.href = '/login?fresh=' + new Date().getTime();
  };

  const createPortalSession = async () => {
    if (window.location.hostname === 'localhost') {
      window.open('https://app.atarpredictionsqld.com.au?mock=portal&customer=dev-customer-id', '_blank');
      return { success: true };
    }

    if (!user?.customerId) {
      setError('User information is missing.');
      return { success: false };
    }

    try {
      const response = await fetch('https://1w8huooby5.execute-api.ap-southeast-2.amazonaws.com/prod/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: user.customerId }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
        return { success: true };
      } else {
        setError('Failed to create portal session.');
        return { success: false };
      }
    } catch (error) {
      console.error('Portal session error:', error);
      setError('Failed to access subscription management.');
      return { success: false };
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, error, login, logout, createPortalSession, setError }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
