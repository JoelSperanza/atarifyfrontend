// src/auth/Login.jsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import '../App.css';

const Login = () => {
  const { login, isLoading, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if this is a reset request (coming from logout)
  const isReset = new URLSearchParams(location.search).get('reset') === 'true';

  useEffect(() => {
    // If it's not a reset request and user is authenticated, redirect to main app
    if (!isReset && isAuthenticated) {
      navigate('/');
    }
    
    // If it's a reset request, clear the URL parameters
    if (isReset) {
      window.history.replaceState({}, document.title, '/login');
    }
  }, [isAuthenticated, navigate, isReset]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login();
  };

  return (
    <div className="content-card" style={{ maxWidth: '500px', margin: '30px auto' }}>
      <h2>Log in to ATAR Predictor</h2>
      <p className="help-text">
        Click the button below to sign in with your account
      </p>
      
      {error && (
        <div style={{ 
          backgroundColor: '#ffebee', 
          color: '#c62828', 
          padding: '10px', 
          borderRadius: '8px', 
          marginBottom: '20px' 
        }}>
          {error}
        </div>
      )}
      
      <button 
        onClick={handleSubmit} 
        className="btn" 
        style={{
          width: '100%',
          marginTop: '10px'
        }}
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Sign In'}
      </button>
      
      <div style={{ 
        marginTop: '30px', 
        textAlign: 'center',
        color: '#666' 
      }}>
        <p>Don't have a subscription yet?</p>
        <a 
          href="https://atarpredictionsqld.com.au/#pricing" 
          className="btn-secondary"
          style={{
            display: 'inline-block',
            marginTop: '10px',
            textDecoration: 'none'
          }}
        >
          Subscribe Now
        </a>
      </div>
    </div>
  );
};

export default Login;