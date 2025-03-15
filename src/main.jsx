import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from "react-oidc-context";

// Use Cognito's recommended configuration
const cognitoAuthConfig = {
  authority: "https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_iDzdvQ5YV",
  client_id: "4isq033nj4h9hfmpfoo8ikjchf",
  redirect_uri: "https://app.atarpredictionsqld.com.au/auth-callback",
  response_type: "code",
  scope: "email openid phone profile",
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </StrictMode>,
)