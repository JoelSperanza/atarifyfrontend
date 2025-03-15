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
      console.log("✅ Authentication code detected. Waiting for authentication...");

      // 🚀 Instead of polling, we listen for `isAuthenticated` changes
      if (auth.isAuthenticated) {
        console.log("🎉 Authentication successful! Redirecting...");
        navigate('/');
      }

      // ⏳ Timeout fail-safe (prevents infinite waiting)
      const timeout = setTimeout(() => {
        if (!auth.isAuthenticated) {
          console.error("❌ Authentication timeout. Redirecting to login...");
          navigate('/login');
        }
      }, 5000); // ⏳ 5 seconds max wait

      return () => clearTimeout(timeout); // Cleanup function

    } else {
      console.warn("⚠️ No authentication code found. Redirecting to home...");
      navigate('/');
    }
  }, [auth.isAuthenticated, navigate]); // 🚀 Reacts to changes in `isAuthenticated`

  return null; // 🚀 No UI flickering, no unnecessary elements
};

export default AuthCallback;

