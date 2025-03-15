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
  const [isProcessingAuth, setIsProcessingAuth] = useState(false);

  useEffect(() => {
    if (isProcessingAuth || oidcAuth.isLoading) {
      return;
    }

    if (oidcAuth.isAuthenticated) {
      const email = oidcAuth.user?.profile?.email;
      if (!email) {
        setError("Authentication error: Missing email.");
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      setIsAuthenticated(true);
      setUser({ email });

      setIsLoading(false);
    } else {
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
    }
  }, [oidcAuth.isAuthenticated, oidcAuth.isLoading, isProcessingAuth]);

  const login = async () => {
    if (isProcessingAuth) return;
    setIsProcessingAuth(true);

    try {
      await oidcAuth.signinRedirect();
    } catch (error) {
      setError("Login failed. Please try again.");
    } finally {
      setTimeout(() => setIsProcessingAuth(false), 2000);
    }
  };

  const logout = async () => {
    console.log("Starting logout process...");
    setIsProcessingAuth(true);

    try {
      // 1️⃣ Remove stored user session
      const storageKey = `oidc.user:https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_iDzdvQ5YV:4isq033nj4h9hfmpfoo8ikjchf`;
      sessionStorage.removeItem(storageKey);
      localStorage.removeItem(storageKey);

      if (oidcAuth?.removeUser) {
        await oidcAuth.removeUser();
      }

      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error("Error during logout:", error);
    }

    // 2️⃣ Construct Cognito logout URL
    const clientId = "4isq033nj4h9hfmpfoo8ikjchf";
    const logoutUri = "https://atarpredictionsqld.com.au";
    const cognitoDomain = "https://ap-southeast-2idzdvq5yv.auth.ap-southeast-2.amazoncognito.com";
    const logoutUrl = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;

    console.log("Logout URL:", logoutUrl);

    // 3️⃣ Ensure session is fully cleared before redirecting
    setTimeout(() => {
      console.log("Redirecting to Cognito logout...");
      window.location.replace(logoutUrl);
    }, 500);
    
    // 4️⃣ Ensure processing flag is cleared after logout
    setTimeout(() => {
      setIsProcessingAuth(false);
    }, 2000);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, error, login, logout, setError }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);


