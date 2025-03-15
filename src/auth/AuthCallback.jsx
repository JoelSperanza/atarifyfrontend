// src/auth/AuthCallback.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';

const AuthCallback = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [debugInfo, setDebugInfo] = useState({});
  
  useEffect(() => {
    // Log detailed state for debugging
    const authState = { 
      isLoading: auth.isLoading, 
      isAuthenticated: auth.isAuthenticated,
      hasError: !!auth.error,
      errorMessage: auth.error?.message,
      location: window.location.href
    };
    
    console.log("Auth callback state:", authState);
    setDebugInfo(authState);
    
    // Handle authentication completion
    if (!auth.isLoading) {
      if (auth.isAuthenticated) {
        console.log("Authentication successful, redirecting to app");
        navigate('/');
      } else if (auth.error) {
        console.error("Auth callback error:", auth.error);
        // Wait a moment before redirecting to avoid loops
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        console.log("Not authenticated and no error");
        // If we reach here, something unexpected happened
        // Try force-handling the callback
        try {
          // This is an advanced debugging step to help diagnose the issue
          const urlParams = new URLSearchParams(window.location.search);
          const code = urlParams.get('code');
          if (code) {
            console.log("Found authorization code, but auth library didn't process it");
          } else {
            console.log("No authorization code in URL");
          }
        } catch (e) {
          console.error("Error checking URL params:", e);
        }
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
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
      </div>
    </div>
  );
};

export default AuthCallback;