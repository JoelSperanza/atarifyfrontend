// src/auth/AuthCallback.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';

const AuthCallback = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  
  useEffect(() => {
    // Simply wait for the authentication process to complete
    if (!auth.isLoading) {
      if (auth.isAuthenticated) {
        // On successful authentication, redirect to the main app
        navigate('/');
      } else if (auth.error) {
        // If there's an error, log it and redirect to the main app
        // The ProtectedRoute will handle redirecting to login if needed
        console.error("Auth callback error:", auth.error);
        navigate('/');
      }
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.error, navigate]);
  
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      <div>Processing authentication...</div>
    </div>
  );
};

export default AuthCallback;