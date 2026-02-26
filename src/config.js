// API Configuration
// In dev mode, fall back to localhost if not set so the app loads without .env
const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:7071/api' : '');

if (!API_URL) {
  throw new Error('VITE_API_URL environment variable is not set');
}

export const config = {
  apiUrl: API_URL
};

export default config;
