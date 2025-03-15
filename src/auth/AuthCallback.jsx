// src/auth/AuthCallback.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';

const AuthCallback = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  
  useEffect(() => {
    // Add detailed logging
    console.log("Auth callback state:", { 
      isLoading: auth.isLoading, 
      isAuthenticated: auth.isAuthenticated,
      error: auth.error,
      user: auth.user
    });
    
    // Simply wait for the authentication process to complete
    if (!auth.isLoading) {
      if (auth.isAuthenticated) {
        console.log("Authentication successful, redirecting to app");
        navigate('/');
      } else if (auth.error) {
        console.error("Auth callback error:", auth.error);
        navigate('/');
      } else {
        console.log("Not authenticated but no error");
        // There might be a silent issue - manually redirect to login
        window.location.href = "https://ap-southeast-2idzdvq5yv.auth.ap-southeast-2.amazoncognito.com/login?client_id=4isq033nj4h9hfmpfoo8ikjchf&redirect_uri=https://app.atarpredictionsqld.com.au/auth-callback&response_type=code";
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
      <div>
        <p>Processing authentication...</p>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
          Auth state: {auth.isLoading ? "Loading" : auth.isAuthenticated ? "Authenticated" : "Not authenticated"}
          {auth.error && <span style={{ color: 'red' }}> (Error: {auth.error.message})</span>}
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;