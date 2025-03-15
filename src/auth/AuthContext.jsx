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
  const [isProcessingAuth, setIsProcessingAuth] = useState(false); // Prevents sign-in loops

  useEffect(() => {
    if (isProcessingAuth) {
      return; // Stop auth check while login/logout is in progress
    }

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
            await oidcAuth.removeUser();
            setIsAuthenticated(false);
            setUser(null);
            setError('No active subscription found for this email.');
          }
        } catch (error) {
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
  }, [oidcAuth.isAuthenticated, oidcAuth.isLoading, oidcAuth.user, isProcessingAuth]);

  const login = async () => {
    setError(null);
    setIsProcessingAuth(true);

    try {
      await oidcAuth.signinRedirect();
    } catch (error) {
      setError("Login failed. Please try again.");
    } finally {
      setTimeout(() => setIsProcessingAuth(false), 2000); // Prevents race conditions
    }
  };

  const logout = async () => {
    setIsProcessingAuth(true);

    try {
      const storageKey = `oidc.user:https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_iDzdvQ5YV:4isq033nj4h9hfmpfoo8ikjchf`;
      sessionStorage.removeItem(storageKey);
      localStorage.removeItem(storageKey);

      if (oidcAuth && typeof oidcAuth.removeUser === 'function') {
        await oidcAuth.removeUser();
      }
    } catch (e) {
      console.error("Error during logout:", e);
    }

    const clientId = "4isq033nj4h9hfmpfoo8ikjchf";
    const logoutUri = "https://atarpredictionsqld.com.au"; // No www
    const cognitoDomain = "https://ap-southeast-2idzdvq5yv.auth.ap-southeast-2.amazoncognito.com";
    const logoutUrl = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;

    setTimeout(() => {
      window.location.replace(logoutUrl);

      setTimeout(() => {
        setIsAuthenticated(false);
        setUser(null);
        setIsProcessingAuth(false);
      }, 2000);
    }, 500);
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

