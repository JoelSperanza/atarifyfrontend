// src/auth/AuthCallback.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';

const AuthCallback = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  let authCheckInterval; // ✅ Define it here so it's always in scope

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      console.log("✅ Authentication code detected. Waiting for authentication to complete...");

      // ✅ Now correctly assigning to the variable defined outside
      authCheckInterval = setInterval(() => {
        if (!auth.isLoading) {
          clearInterval(authCheckInterval); // ✅ Now always valid

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

    return () => {
      if (authCheckInterval) {
        clearInterval(authCheckInterval); // ✅ Only clears if it exists
      }
    };
  }, [auth, navigate]);

  return null; // No UI needed, just silently process authentication
};

export default AuthCallback;

