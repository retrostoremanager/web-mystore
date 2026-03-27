// API Configuration
// In dev mode, fall back to localhost if not set so the app loads without .env
const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '/api' : '');

if (!API_URL) {
  throw new Error('VITE_API_URL environment variable is not set');
}

// Game catalog + market pricing (api-gamedb). In production this MUST be set at build time
// (GitHub Actions env for `npm run build`). Azure SWA "Configuration" does not inject Vite `VITE_*`.
const GAME_DB_API_URL = (
  import.meta.env.VITE_GAMEDB_API_URL ||
  (import.meta.env.DEV ? '/gamedb-api' : '')
).trim();

// Stripe publishable key for payment method collection (subscription billing)
// Use pk_test_... for development, pk_live_... for production
const STRIPE_PUBLISHABLE_KEY =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

export const config = {
  apiUrl: API_URL,
  gameDbApiUrl: GAME_DB_API_URL,
  stripePublishableKey: STRIPE_PUBLISHABLE_KEY,
};

export default config;
