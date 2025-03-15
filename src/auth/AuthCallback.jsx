// src/auth/AuthCallback.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth as useOidcAuth } from 'react-oidc-context';

const AuthCallback = () => {
  const navigate = useNavigate();
  const auth = useOidcAuth();
  
  useEffect(() => {
    // Process authentication callback
    const processCallback = async () => {
      try {
        // Attempt to process the auth callback
        // The OIDC library should handle this automatically
        
        // Wait for authentication process to complete
        if (!auth.isLoading && auth.isAuthenticated) {
          // Redirect to the main app after successful authentication
          navigate('/');
        } else if (!auth.isLoading && !auth.isAuthenticated) {
          // If authentication failed, redirect to Cognito login again
          window.location.href = "https://ap-southeast-2idzdvq5yv.auth.ap-southeast-2.amazoncognito.com/login?client_id=4isq033nj4h9hfmpfoo8ikjchf&redirect_uri=https://app.atarpredictionsqld.com.au/auth-callback&response_type=code";
        }
      } catch (error) {
        console.error("Authentication callback processing error:", error);
        // On error, redirect to Cognito login
        window.location.href = "https://ap-southeast-2idzdvq5yv.auth.ap-southeast-2.amazoncognito.com/login?client_id=4isq033nj4h9hfmpfoo8ikjchf&redirect_uri=https://app.atarpredictionsqld.com.au/auth-callback&response_type=code";
      }
    };

    processCallback();
  }, [auth.isAuthenticated, auth.isLoading, navigate]);
  
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