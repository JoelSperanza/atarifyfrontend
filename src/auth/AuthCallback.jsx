// src/auth/AuthCallback.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';

const AuthCallback = () => {
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    // ✅ If authentication is done, redirect to homepage
    if (auth.isAuthenticated) {
      navigate('/');
      return;
    }

    // ✅ If there's an error, log it and send user to homepage
    if (auth.error) {
      console.error("Authentication error:", auth.error);
      navigate('/');
      return;
    }
    
    // ✅ If still loading, do nothing
  }, [auth.isAuthenticated, auth.error, navigate]);

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

