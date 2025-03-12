// src/auth/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth as useOidcAuth } from 'react-oidc-context';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const oidcAuth = useOidcAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  // Effect to handle Cognito authentication status changes
  useEffect(() => {
    if (oidcAuth.isLoading) {
      setIsLoading(true);
      return;
    }

    if (oidcAuth.isAuthenticated && oidcAuth.user) {
      const email = oidcAuth.user.profile.email;
      
      // When Cognito auth is successful, verify subscription
      const verifySubscription = async () => {
        setIsLoading(true);
        
        // LOCAL DEVELOPMENT BYPASS
        if (window.location.hostname === 'localhost') {
          console.log('DEV MODE: Bypassing API validation for Cognito authenticated user');
          setIsAuthenticated(true);
          setUser({ 
            email, 
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
            body: JSON.stringify({ email }),
          });
          
          const data = await response.json();
          
          if (data.active) {
            setIsAuthenticated(true);
            setUser({ 
              email, 
              customerId: data.customerId,
              subscriptionId: data.subscriptionId
            });
          } else {
            // Subscription inactive or expired
            oidcAuth.removeUser(); // Sign out from Cognito
            setIsAuthenticated(false);
            setUser(null);
            setError('No active subscription found for this email. Please subscribe first.');
          }
        } catch (error) {
          console.error('Auth verification failed:', error);
          setIsAuthenticated(false);
          setUser(null);
          setError('Authentication verification failed. Please try logging in again.');
        } finally {
          setIsLoading(false);
        }
      };
      
      verifySubscription();
    } else {
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
    }
  }, [oidcAuth.isAuthenticated, oidcAuth.isLoading, oidcAuth.user]);

  const login = async () => {
    setError(null);
    // Redirect to Cognito login
    oidcAuth.signinRedirect();
    return { success: true };
  };

  const logout = () => {
    oidcAuth.removeUser();
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