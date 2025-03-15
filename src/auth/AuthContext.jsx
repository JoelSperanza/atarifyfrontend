const logout = () => {
  // Local cleanup
  setIsAuthenticated(false);
  setUser(null);
  
  // Clear tokens from sessionStorage (where they're actually stored)
  try {
    const storageKey = `oidc.user:https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_iDzdvQ5YV:4isq033nj4h9hfmpfoo8ikjchf`;
    sessionStorage.removeItem(storageKey);
    localStorage.removeItem(storageKey);
  } catch (e) {
    console.error("Error clearing storage:", e);
  }
  
  // Remove user from OIDC context
  if (oidcAuth && typeof oidcAuth.removeUser === 'function') {
    try {
      oidcAuth.removeUser();
    } catch (e) {
      console.error("Error removing OIDC user:", e);
    }
  }

  // Use the CORRECT logout URL with /logout (not /login)
  const clientId = "4isq033nj4h9hfmpfoo8ikjchf";
  const logoutUri = "https://www.atarpredictionsqld.com.au";
  const cognitoDomain = "https://ap-southeast-2idzdvq5yv.auth.ap-southeast-2.amazoncognito.com";
  
  // Double-check that we're using /logout in the URL
  const logoutUrl = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  
  // Use window.location.replace for a more complete redirect
  window.location.replace(logoutUrl);
};