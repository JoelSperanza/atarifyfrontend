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
            console.warn("No active subscription found, logging out...");
            await oidcAuth.removeUser();
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

  const logout = async () => {
    console.log("Logout process started");

    try {
      // 1️⃣ Remove authentication tokens from storage
      const storageKey = `oidc.user:https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_iDzdvQ5YV:4isq033nj4h9hfmpfoo8ikjchf`;
      console.log("Clearing session storage token...");
      sessionStorage.removeItem(storageKey);
      localStorage.removeItem(storageKey);

      // 2️⃣ Fully remove the OIDC user session BEFORE updating state
      if (oidcAuth && typeof oidcAuth.removeUser === 'function') {
        console.log("Removing OIDC user...");
        await oidcAuth.removeUser();
      }
    } catch (e) {
      console.error("Error during logout:", e);
    }

    // 3️⃣ Redirect FIRST, then update state after a delay
    const clientId = "4isq033nj4h9hfmpfoo8ikjchf";
    const logoutUri = "https://atarpredictionsqld.com.au"; // No www
    const cognitoDomain = "https://ap-southeast-2idzdvq5yv.auth.ap-southeast-2.amazoncognito.com";
    const logoutUrl = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;

    console.log("Finalizing logout... Redirecting to Cognito logout in 500ms");

    setTimeout(() => {
      console.log("Redirecting to:", logoutUrl);
      window.location.replace(logoutUrl);
      
      // 4️⃣ State update only AFTER redirect (prevent React from interfering)
      setTimeout(() => {
        console.log("Updating React state after logout");
        setIsAuthenticated(false);
        setUser(null);
      }, 2000); // Ensure React updates state AFTER Cognito logout is complete
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



