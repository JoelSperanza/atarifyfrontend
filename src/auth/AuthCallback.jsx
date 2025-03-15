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
      console.log("Authentication code detected. Waiting for authentication to complete...");

      // Wait until authentication is fully settled
      const checkAuth = setInterval(() => {
        if (!auth.isLoading) {
          clearInterval(checkAuth);

          if (auth.isAuthenticated) {
            console.log("✅ Authentication successful. Redirecting...");
            navigate('/');
          } else {
            console.error("❌ Authentication failed. Redirecting to login...");
            navigate('/login');
          }
        }
      }, 100);

    } else {
      console.warn("No authentication code found. Redirecting to login...");
      navigate('/login');
    }

    return () => clearInterval(checkAuth);
  }, [auth, navigate]);

  return null; // No UI needed, we just process authentication and move on
};

export default AuthCallback;

