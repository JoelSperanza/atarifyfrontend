// src/auth/ProtectedRoute.jsx
import React from 'react';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, login } = useAuth();
  
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
    // This is the Cognito-recommended approach
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