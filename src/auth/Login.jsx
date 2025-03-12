// src/auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import '../App.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const { login, isLoading, error, setError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    console.log('Attempting login with email:', email);
    try {
      const result = await login(email);
      console.log('Login result:', result);
      
      if (result.success) {
        navigate('/');
      } else if (result.redirectToSubscribe) {
        // Redirect to subscription page
        window.location.href = 'https://atarpredictionsqld.com.au/#pricing';
      }
    } catch (error) {
      console.error('Login error caught in component:', error);
    }
  };

  return (
    <div className="content-card" style={{ maxWidth: '500px', margin: '30px auto' }}>
      <h2>Log in to ATAR Predictor</h2>
      <p className="help-text">
        Enter the email address you used for your subscription
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
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label 
            htmlFor="email" 
            style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '500' 
            }}
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              fontSize: '16px'
            }}
            placeholder="your@email.com"
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="btn" 
          style={{
            width: '100%',
            marginTop: '10px'
          }}
          disabled={isLoading}
        >
          {isLoading ? 'Verifying...' : 'Log In'}
        </button>
      </form>
      
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

      {/* Debug option for development */}
      <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <p style={{ fontSize: '12px', color: '#999', textAlign: 'center' }}>
          Development mode: Any email will work
        </p>
      </div>
    </div>
  );
};

export default Login;