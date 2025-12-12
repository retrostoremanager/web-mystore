// Mock game API service
// This simulates calls to Price Charting or GameEye API
// Replace with actual API calls when ready

const MOCK_GAMES = [
  {
    id: 'pc-001',
    title: 'The Legend of Zelda: Breath of the Wild',
    console: 'Nintendo Switch',
    releaseDate: '2017-03-03',
    publisher: 'Nintendo',
    genre: 'Action-Adventure',
    imageUrl: null,
  },
  {
    id: 'pc-002',
    title: 'Super Mario Odyssey',
    console: 'Nintendo Switch',
    releaseDate: '2017-10-27',
    publisher: 'Nintendo',
    genre: 'Platform',
    imageUrl: null,
  },
  {
    id: 'pc-003',
    title: 'Elden Ring',
    console: 'PlayStation 5',
    releaseDate: '2022-02-25',
    publisher: 'Bandai Namco',
    genre: 'Action RPG',
    imageUrl: null,
  },
  {
    id: 'pc-004',
    title: 'God of War Ragnarök',
    console: 'PlayStation 5',
    releaseDate: '2022-11-09',
    publisher: 'Sony Interactive Entertainment',
    genre: 'Action-Adventure',
    imageUrl: null,
  },
  {
    id: 'pc-005',
    title: 'Halo Infinite',
    console: 'Xbox Series X',
    releaseDate: '2021-12-08',
    publisher: 'Xbox Game Studios',
    genre: 'First-Person Shooter',
    imageUrl: null,
  },
  {
    id: 'pc-006',
    title: 'Pokémon Scarlet',
    console: 'Nintendo Switch',
    releaseDate: '2022-11-18',
    publisher: 'Nintendo',
    genre: 'RPG',
    imageUrl: null,
  },
  {
    id: 'pc-007',
    title: 'Mario Kart 8 Deluxe',
    console: 'Nintendo Switch',
    releaseDate: '2017-04-28',
    publisher: 'Nintendo',
    genre: 'Racing',
    imageUrl: null,
  },
  {
    id: 'pc-008',
    title: 'Call of Duty: Modern Warfare II',
    console: 'PlayStation 5',
    releaseDate: '2022-10-28',
    publisher: 'Activision',
    genre: 'First-Person Shooter',
    imageUrl: null,
  },
  {
    id: 'pc-009',
    title: 'Animal Crossing: New Horizons',
    console: 'Nintendo Switch',
    releaseDate: '2020-03-20',
    publisher: 'Nintendo',
    genre: 'Simulation',
    imageUrl: null,
  },
  {
    id: 'pc-010',
    title: 'Horizon Forbidden West',
    console: 'PlayStation 5',
    releaseDate: '2022-02-18',
    publisher: 'Sony Interactive Entertainment',
    genre: 'Action RPG',
    imageUrl: null,
  },
];

// Simulate API search delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Search for games by title
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of matching games
 */
export const searchGames = async (query) => {
  // Simulate API delay
  await delay(500);

  if (!query || query.trim().length === 0) {
    return [];
  }

  const searchTerm = query.toLowerCase();
  const results = MOCK_GAMES.filter(
    (game) =>
      game.title.toLowerCase().includes(searchTerm) ||
      game.console.toLowerCase().includes(searchTerm) ||
      game.publisher.toLowerCase().includes(searchTerm)
  );

  return results;
};

/**
 * Get game details by ID
 * @param {string} gameId - Game ID
 * @returns {Promise<Object|null>} Game details or null if not found
 */
export const getGameById = async (gameId) => {
  await delay(300);
  return MOCK_GAMES.find((game) => game.id === gameId) || null;
};

/**
 * Get market prices for a game (from Price Charting API)
 * This would normally call: https://www.pricecharting.com/api/product?t=TOKEN&id=GAME_ID
 * @param {string} gameId - Game ID
 * @returns {Promise<Object>} Market price data
 */
export const getMarketPrices = async (gameId) => {
  await delay(400);
  
  // Mock market price data
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

