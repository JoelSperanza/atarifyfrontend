// src/auth/AuthCallback.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';

const AuthCallback = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [loadingMessage, setLoadingMessage] = useState("Processing authentication...");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      console.log("✅ Authentication code detected. Waiting for authentication...");

      // Start a loading effect so users see something happening
      const messages = [
        "Processing authentication...",
        "Verifying login details...",
        "Finalizing authentication...",
      ];
      let index = 0;
      const messageInterval = setInterval(() => {
        setLoadingMessage(messages[index]);
        index = (index + 1) % messages.length;
      }, 1200); // Rotate messages every 1.2 seconds

      // 🚀 Listen for authentication state updates
      if (auth.isAuthenticated) {
        console.log("🎉 Authentication successful! Redirecting...");
        clearInterval(messageInterval);
        navigate('/');
      }

      // ⏳ Timeout fail-safe (prevents infinite waiting)
      const timeout = setTimeout(() => {
        clearInterval(messageInterval);
        if (!auth.isAuthenticated) {
          console.error("❌ Authentication timeout. Redirecting to login...");
          navigate('/login');
        }
      }, 5000); // ⏳ 5 seconds max wait

      return () => {
        clearInterval(messageInterval);
        clearTimeout(timeout);
      };

    } else {
      console.warn("⚠️ No authentication code found. Redirecting to home...");
      navigate('/');
    }
  }, [auth.isAuthenticated, navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      fontSize: '1.2rem', 
      color: '#444'
    }}>
      {loadingMessage}
    </div>
  );
};

export default AuthCallback;
