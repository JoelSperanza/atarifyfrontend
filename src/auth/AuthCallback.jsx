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
      console.log("✅ Authentication code detected. Waiting for authentication to complete...");

      // Continuously check authentication state
      const interval = setInterval(() => {
        if (!auth.isLoading) {
          clearInterval(interval);

          if (auth.isAuthenticated) {
            console.log("🎉 Authentication successful! Redirecting...");
            navigate('/');
          } else {
            console.error("❌ Authentication failed. Staying on auth-callback.");
          }
        }
      }, 100); // Check every 100ms

    } else {
      console.warn("⚠️ No authentication code found. Redirecting to home...");
      navigate('/');
    }

    return () => clearInterval(interval);
  }, [auth, navigate]);

  return null; // No UI needed, just silently process authentication
};

export default AuthCallback;

