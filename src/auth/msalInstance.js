import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from '../authConfig';

let msalInstance = null;

/**
 * Gets or creates the MSAL PublicClientApplication instance.
 * When client ID is not configured, returns an instance with placeholder config
 * so MsalProvider can mount (LoginPage will show "not configured" message).
 */
export function getMsalInstance() {
  if (!msalInstance) {
    const config = { ...msalConfig };
    if (!config.auth.clientId) {
      config.auth.clientId = '00000000-0000-0000-0000-000000000000';
    }
    msalInstance = new PublicClientApplication(config);
  }
  return msalInstance;
}

export function isAuthConfigured() {
  return Boolean(import.meta.env.VITE_ENTRA_CLIENT_ID);
}
