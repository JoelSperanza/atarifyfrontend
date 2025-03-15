// src/auth/ProtectedRoute.jsx
import React from 'react';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
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
    // Redirect directly to Cognito login instead of the login page
    window.location.href = "https://ap-southeast-2idzdvq5yv.auth.ap-southeast-2.amazoncognito.com/login?client_id=4isq033nj4h9hfmpfoo8ikjchf&redirect_uri=https://app.atarpredictionsqld.com.au/auth-callback&response_type=code";
    return null; // Return null while redirecting
  }
  
  return children;
};

export default ProtectedRoute;