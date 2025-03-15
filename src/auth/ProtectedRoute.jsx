// src/auth/ProtectedRoute.jsx
import React, { useEffect } from 'react';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, login } = useAuth();
  
  useEffect(() => {
    // Check if we have an auth code in the URL but aren't authenticated
    if (!isLoading && !isAuthenticated) {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      if (code) {
        console.log("Found auth code but not authenticated, clearing URL and redirecting");
        // Clear the URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [isLoading, isAuthenticated]);
  
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    // Use the login function which uses oidcAuth.signinRedirect()
    login();
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <div>Redirecting to login...</div>
      </div>
    );
  }
  
  return children;
};

export default ProtectedRoute;