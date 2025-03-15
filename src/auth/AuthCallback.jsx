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

    // ✅ Only log authentication state if there's an actual error
    if (auth.error) {
      console.error("Auth error:", auth.error);
    }

    // ✅ Only trigger sign-in if needed
    if (code && !auth.isLoading && !auth.isAuthenticated && !auth.error) {
      auth.signinCallback().then(() => {
        navigate('/');
      }).catch((error) => {
        console.error("Signin callback failed:", error);
        navigate('/');
      });
    }
    // ✅ Redirect once authentication is complete
    else if (!auth.isLoading) {
      if (auth.isAuthenticated) {
        navigate('/');
      } else if (auth.error) {
        navigate('/');
      }
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.error, navigate]);

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
