// src/auth/AuthCallback.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';

const AuthCallback = () => {
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      console.log("Authentication code detected. Checking authentication state...");

      // Wait for authentication to complete
      const checkAuth = setInterval(() => {
        if (!auth.isLoading) {
          clearInterval(checkAuth);

          if (auth.isAuthenticated) {
            console.log("Authentication successful, redirecting...");
            navigate('/');
          } else {
            console.error("Authentication failed or not complete.");
            navigate('/');
          }
        }
      }, 500);
    } else {
      console.warn("No authentication code found. Redirecting...");
      navigate('/');
    }

    return () => clearInterval(checkAuth);
  }, [auth, navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      padding: '20px' 
    }}>
      <div>Processing authentication...</div>
    </div>
  );
};

export default AuthCallback;

