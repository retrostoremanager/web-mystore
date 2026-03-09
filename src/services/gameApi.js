// Game API - uses backend so all games exist in DB (avoids FK violation on inventory create)
import config from '../config';

/**
 * Search for games by title, console, or publisher.
 * Uses backend API - all returned games exist in the game table.
 * @param {string} query - Search query
 * @param {Object} authHeaders - Headers from useAuth().getAuthHeaders()
 * @returns {Promise<Array>} Array of matching games from database
 */
export const searchGames = async (query, authHeaders = {}) => {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const url = `${config.apiUrl}/games/search?q=${encodeURIComponent(query.trim())}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.message || result?.errors?.[0] || 'Failed to search games');
  }

  return result?.data ?? [];
};

/**
 * Get game details by ID (from selected search result - no API call needed)
 * @param {string} gameId - Game ID
 * @param {Array} searchResults - Current search results to look up in
 * @returns {Object|null} Game details or null if not found
 */
export const getGameById = (gameId, searchResults = []) => {
  return searchResults.find((game) => game.id === gameId) || null;
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Get market prices for a game (from Price Charting API)
 * TODO: Replace with actual Price Charting API when ready
 * @param {string} gameId - Game ID
 * @returns {Promise<Object>} Market price data
 */
export const getMarketPrices = async (gameId) => {
  await delay(400);
  return {
    loose: 29.99,
    complete: 39.99,
    new: 59.99,
    cib: 39.99, // Complete in Box
  };
};

// TODO: Replace with actual Price Charting API integration
// Example implementation:
/*
export const searchGames = async (query, apiToken) => {
  const response = await fetch(
    `https://www.pricecharting.com/api/products?t=${apiToken}&q=${encodeURIComponent(query)}`
  );
  const data = await response.json();
  return data.products || [];
};
*/

