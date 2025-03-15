// src/auth/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth as useOidcAuth } from 'react-oidc-context';

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

  // Use the OIDC auth's signinRedirect method as recommended by Cognito
  const login = () => {
    setError(null);
    oidcAuth.signinRedirect();
  };

  // Enhanced logout function with more thorough cleanup
  const logout = () => {
    // Log the beginning of logout process
    console.log("Starting logout process");
    
    // Local state cleanup
    setIsAuthenticated(false);
    setUser(null);
    
    // Make sure we completely remove the user from OIDC context
    if (oidcAuth) {
      try {
        // First remove the user from OIDC storage
        if (typeof oidcAuth.removeUser === 'function') {
          console.log("Removing OIDC user");
          oidcAuth.removeUser();
        }
        
        // Clear any tokens from storage
        const storageKey = `oidc.user:https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_iDzdvQ5YV:4isq033nj4h9hfmpfoo8ikjchf`;
        console.log("Clearing storage for key:", storageKey);
        
        localStorage.removeItem(storageKey);
        sessionStorage.removeItem(storageKey);
        
        // Clear any other potential auth-related storage
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('oidc.') || key.includes('cognito'))) {
            console.log("Removing additional local storage item:", key);
            localStorage.removeItem(key);
          }
        }
        
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && (key.startsWith('oidc.') || key.includes('cognito'))) {
            console.log("Removing additional session storage item:", key);
            sessionStorage.removeItem(key);
          }
        }
      } catch (e) {
        console.error("Error during local logout:", e);
      }
    }

    // Then redirect to Cognito's logout endpoint
    const clientId = "4isq033nj4h9hfmpfoo8ikjchf";
    const logoutUri = "https://www.atarpredictionsqld.com.au"; // Match exactly with Cognito settings
    const cognitoDomain = "https://ap-southeast-2idzdvq5yv.auth.ap-southeast-2.amazoncognito.com";
    
    const logoutUrl = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
    console.log("Redirecting to logout URL:", logoutUrl);
    
    // Use window.location.replace instead of href for a more complete redirect
    window.location.replace(logoutUrl);
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