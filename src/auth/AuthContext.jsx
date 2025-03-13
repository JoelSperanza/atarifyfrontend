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
    // Clear application state
    setIsAuthenticated(false);
    setUser(null);
    
    console.log("Logging out...");
    
    // Try to get the Cognito domain from OIDC settings
    let authority = "";
    if (oidcAuth && oidcAuth.settings && oidcAuth.settings.authority) {
      authority = oidcAuth.settings.authority;
      console.log("Found authority:", authority);
    } else {
      authority = "https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_iDzdvQ5YV";
      console.log("Using default authority");
    }
    
    // Get client ID
    let clientId = "";
    if (oidcAuth && oidcAuth.settings && oidcAuth.settings.client_id) {
      clientId = oidcAuth.settings.client_id;
      console.log("Found client ID:", clientId);
    } else {
      clientId = "4isq033nj4h9hfmpfoo8ikjchf";
      console.log("Using default client ID");
    }
    
    // First try removing the user from OIDC context
    if (oidcAuth && oidcAuth.removeUser) {
      try {
        console.log("Removing OIDC user");
        oidcAuth.removeUser();
      } catch (e) {
        console.error("Error removing OIDC user:", e);
      }
    }
    
    // Wipe all browser state for this site as aggressively as possible
    console.log("Clearing storage");
    try {
      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear all cookies
      document.cookie.split(';').forEach(cookie => {
        const parts = cookie.split('=');
        const name = parts[0].trim();
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
      });
      
      // Use js-cookie to clear cookies as well (double clean)
      Object.keys(Cookies.get()).forEach(function(cookieName) {
        Cookies.remove(cookieName);
      });
    } catch (e) {
      console.error("Error clearing storage:", e);
    }
    
    // Force a page navigation to break any in-memory state
    console.log("Redirecting to new page");
    
    // Construct a URL for our own page that won't trigger an automatic login
    const randomParam = Math.random().toString(36).substring(2, 15);
    const destination = `/login?reset=true&nocache=${randomParam}`;
    
    // Navigate to our own page first
    window.location.href = destination;
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