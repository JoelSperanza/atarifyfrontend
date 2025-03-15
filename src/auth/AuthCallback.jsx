// src/auth/AuthCallback.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';

const AuthCallback = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [debugInfo, setDebugInfo] = useState({});
  const [processingState, setProcessingState] = useState('processing');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    const authState = { 
      isLoading: auth.isLoading, 
      isAuthenticated: auth.isAuthenticated,
      hasError: !!auth.error,
      errorMessage: auth.error?.message,
      hasCode: !!code,
      location: window.location.href
    };

    console.log("Auth callback state:", authState);
    setDebugInfo(authState);

    // If we have a code but aren't authenticated, try to manually trigger signin
    if (code && !auth.isLoading && !auth.isAuthenticated && !auth.error) {
      console.log("Manually triggering signinCallback");
      setProcessingState('manual-signin');
      
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } 
    // Standard flow - navigate when auth is complete
    else if (!auth.isLoading) {
      if (auth.isAuthenticated) {
        console.log("Authentication successful, redirecting to app");
        setProcessingState('success');
        navigate('/');
      } else if (auth.error) {
        console.error("Auth callback error:", auth.error);
        setProcessingState('error');
        setTimeout(() => {
          navigate('/');
        }, 2000);
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
      {processingState === 'processing' && <div>Processing authentication...</div>}
      {processingState === 'manual-signin' && <div>Manually processing authentication code...</div>}
      {processingState === 'success' && <div>Authentication successful! Redirecting...</div>}
      {processingState === 'error' && <div>Authentication error. Redirecting...</div>}
      
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
      </div>
    </div>
  );
};

export default AuthCallback;
