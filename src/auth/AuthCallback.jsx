// src/auth/AuthCallback.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';

const AuthCallback = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [message, setMessage] = useState(""); // 🔄 Replaces janky debug messages with an empty string

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      setMessage(""); // 🔄 Instead of showing debug messages, we just keep it empty

      console.log("✅ Authentication code detected. Waiting for authentication...");
      
      // 🔄 Wait for authentication to settle naturally, just like before
      const interval = setInterval(() => {
        if (!auth.isLoading) {
          clearInterval(interval);

          if (auth.isAuthenticated) {
            console.log("🎉 Authentication successful! Redirecting...");
            navigate('/');
          } else {
            console.error("❌ Authentication failed. Redirecting to login...");
            navigate('/login'); // Redirect to login only if auth actually failed
          }
        }
      }, 100);

      return () => clearInterval(interval); // Cleanup function

    } else {
      console.warn("⚠️ No authentication code found. Redirecting to home...");
      navigate('/');
    }
  }, [auth, navigate]);

  return <div>{message}</div>; // 🔄 Message exists, but it's always empty (no flickering UI)
};

export default AuthCallback;

