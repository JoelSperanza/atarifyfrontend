// src/auth/AuthCallback.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';

const AuthCallback = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [loadingMessage, setLoadingMessage] = useState("Processing.");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      console.log("✅ Authentication code detected. Waiting for authentication...");

      // 🔄 Loading dots animation: "Processing." → "Processing.." → "Processing..."
      let dots = 1;
      const messageInterval = setInterval(() => {
        dots = (dots % 3) + 1; // Cycles 1 → 2 → 3 → 1
        setLoadingMessage(`Processing${".".repeat(dots)}`);
      }, 500); // Updates every 0.5 seconds for smooth animation

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

