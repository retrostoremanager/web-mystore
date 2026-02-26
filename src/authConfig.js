/**
 * MSAL configuration for Microsoft Entra External ID (CIAM).
 * Uses env vars: VITE_ENTRA_CLIENT_ID, VITE_ENTRA_AUTHORITY
 * When not set, auth is disabled (login will show config message).
 */
export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_ENTRA_CLIENT_ID || '',
    authority:
      import.meta.env.VITE_ENTRA_AUTHORITY ||
      'https://mystoreciamdev.ciamlogin.com/mystoreciamdev.onmicrosoft.com',
    redirectUri: import.meta.env.VITE_ENTRA_REDIRECT_URI || window.location.origin,
    postLogoutRedirectUri: import.meta.env.VITE_ENTRA_POST_LOGOUT_URI || '/',
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

/**
 * Scopes for login. OIDC scopes (openid, profile, email) are added by default.
 */
export const loginRequest = {
  scopes: [],
};
