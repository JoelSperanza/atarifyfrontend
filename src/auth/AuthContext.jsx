// src/auth/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for auth cookie on load
    const checkAuth = async () => {
      const userEmail = Cookies.get('userEmail');
      
      if (userEmail) {
        // LOCAL DEVELOPMENT BYPASS
        if (window.location.hostname === 'localhost') {
          console.log('DEV MODE: Bypassing API validation for stored user');
          setIsAuthenticated(true);
          setUser({ 
            email: userEmail, 
            customerId: 'dev-customer-id',
            subscriptionId: 'dev-subscription-id'
          });
          setIsLoading(false);
          return;
        }
        
        try {
          // Verify subscription status
          const response = await fetch('https://1w8huooby5.execute-api.ap-southeast-2.amazonaws.com/prod/verify-subscription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: userEmail }),
          });
          
          const data = await response.json();
          
          if (data.active) {
            setIsAuthenticated(true);
            setUser({ 
              email: userEmail, 
              customerId: data.customerId,
              subscriptionId: data.subscriptionId
            });
          } else {
            // Subscription inactive or expired
            Cookies.remove('userEmail');
            setIsAuthenticated(false);
            setUser(null);
          }
        } catch (error) {
          console.error('Auth verification failed:', error);
          setIsAuthenticated(false);
          setUser(null);
          setError('Authentication verification failed. Please try logging in again.');
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (email) => {
    setIsLoading(true);
    setError(null);
    
    // LOCAL DEVELOPMENT BYPASS
    if (window.location.hostname === 'localhost') {
      console.log('DEV MODE: Bypassing API validation for login');
      Cookies.set('userEmail', email, { expires: 7 });
      setIsAuthenticated(true);
      setUser({ 
        email, 
        customerId: 'dev-customer-id',
        subscriptionId: 'dev-subscription-id'
      });
      setIsLoading(false);
      return { success: true };
    }
    
    try {
      console.log('Making API request to verify subscription');
      const response = await fetch('https://1w8huooby5.execute-api.ap-southeast-2.amazonaws.com/prod/verify-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      console.log('API response status:', response.status);
      const data = await response.json();
      console.log('API response data:', data);
      
      if (data.active) {
        Cookies.set('userEmail', email, { expires: 7 });
        setIsAuthenticated(true);
        setUser({ 
          email, 
          customerId: data.customerId,
          subscriptionId: data.subscriptionId
        });
        return { success: true };
      } else {
        setError('No active subscription found for this email. Please subscribe first.');
        return { 
          success: false, 
          redirectToSubscribe: true 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    Cookies.remove('userEmail');
    setIsAuthenticated(false);
    setUser(null);
  };

  const createPortalSession = async () => {
    // LOCAL DEVELOPMENT BYPASS
    if (window.location.hostname === 'localhost') {
      console.log('DEV MODE: Bypassing portal session creation');
      window.open('https://app.atarpredictionsqld.com.au?mock=portal&customer=dev-customer-id', '_blank');
      return { success: true };
    }
    
    if (!user?.customerId) {
      setError('User information is missing. Please log in again.');
      return { success: false };
    }
    
    try {
      const response = await fetch('https://1w8huooby5.execute-api.ap-southeast-2.amazonaws.com/prod/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId: user.customerId }),
      });
      
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
        return { success: true };
      } else {
        setError('Failed to create portal session.');
        return { success: false };
      }
    } catch (error) {
      console.error('Portal session error:', error);
      setError('Failed to access subscription management. Please try again later.');
      return { success: false };
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        isLoading, 
        user, 
        error, 
        login, 
        logout, 
        createPortalSession,
        setError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);