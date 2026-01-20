// API Configuration
const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error('VITE_API_URL environment variable is not set');
}

export const config = {
  apiUrl: API_URL
};

export default config;
