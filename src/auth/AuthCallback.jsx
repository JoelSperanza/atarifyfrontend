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
      console.log("Processing authentication code...");
      auth.signinCallback().then(() => {
        console.log("Authentication successful, redirecting...");
        navigate('/');
      }).catch(error => {
        console.error("Authentication error:", error);
        navigate('/');
      });
    }
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

