// Game catalog + pricing from api-gamedb (separate from MyStore VITE_API_URL)
import config from '../config';

// --- Box art: free / open-source libretro-thumbnails (no API key) --------------------
// api-gamedb has no cover images, so derive a box-art URL from title + console.
// Best-effort: libretro uses No-Intro naming, so not every retail title resolves; the UI
// should use <img onError> to fall back to a placeholder when a cover 404s.
const LIBRETRO_SYSTEM = {
  'Nintendo Entertainment System': 'Nintendo - Nintendo Entertainment System',
  'Super Nintendo Entertainment System': 'Nintendo - Super Nintendo Entertainment System',
  'Nintendo 64': 'Nintendo - Nintendo 64',
  'Nintendo GameCube': 'Nintendo - Nintendo GameCube',
  'Nintendo Wii': 'Nintendo - Wii',
  'Game Boy': 'Nintendo - Game Boy',
  'Game Boy Color': 'Nintendo - Game Boy Color',
  'Game Boy Advance': 'Nintendo - Game Boy Advance',
  'Nintendo DS': 'Nintendo - Nintendo DS',
  'Sega Genesis': 'Sega - Mega Drive - Genesis',
  'Sega Master System': 'Sega - Master System - Mark III',
  'Sega Saturn': 'Sega - Saturn',
  'Dreamcast': 'Sega - Dreamcast',
  'Sega Game Gear': 'Sega - Game Gear',
  'PlayStation': 'Sony - PlayStation',
  'PlayStation 2': 'Sony - PlayStation 2',
  'PlayStation Portable': 'Sony - PlayStation Portable',
  'Xbox': 'Microsoft - Xbox',
  'TurboGrafx-16': 'NEC - PC Engine - TurboGrafx 16',
  'Atari 2600': 'Atari - 2600',
};

export const getBoxArtUrl = (title, consoleName) => {
  const sys = LIBRETRO_SYSTEM[consoleName];
  if (!sys || !title) return null;
  // libretro filename sanitization: '&' -> '_' and the chars * " / : < > ? \ | -> '_'
  const name = String(title).replace(/&/g, '_').replace(/[*"/:<>?\\|]/g, '_');
  return `https://raw.githubusercontent.com/libretro-thumbnails/${encodeURIComponent(sys)}/master/Named_Boxarts/${encodeURIComponent(name)}.png`;
};

/**
 * Map api-gamedb GET /games JSON (camelCase) into the shape the inventory UI expects.
 * @param {object} raw
 */
export const normalizeGameFromGameDb = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  // Tolerate both the flat DTO (publishers: [{name}]) and the older nested EF shape
  // (gamePublishers: [{publisher: {name}}]).
  const publishers = (
    raw.publishers ?? (raw.gamePublishers ?? []).map((gp) => gp?.publisher)
  )
    .map((p) => p?.name)
    .filter(Boolean);
  const publisherLabel =
    publishers.length > 0 ? publishers.join(', ') : null;
  const genre =
    raw.genre && String(raw.genre).trim() ? String(raw.genre).trim() : null;
  const region =
    raw.region && String(raw.region).trim() ? String(raw.region).trim() : null;

  return {
    id: raw.id,
    title: raw.title ?? '',
    console: raw.system?.name ?? '',
    publisher: publisherLabel,
    genre,
    region,
    releaseDate: raw.releaseDate ?? null,
    imageUrl: raw.imageUrl ?? getBoxArtUrl(raw.title, raw.system?.name),
    systemId: raw.systemId,
    variantId: raw.variantId,
    _source: 'gamedb',
  };
};

/**
 * Derive loose/complete/CIB/new hints from GET /games/:id/pricing buckets.
 * @param {object} pricing - GamePricingResponse JSON
 */
export const mapPricingResponseToLegacyPrices = (pricing) => {
  const buckets = pricing?.buckets ?? [];
  const byCode = new Map(buckets.map((b) => [b.code, b]));
  const medianDollars = (code) => {
    const c = byCode.get(code)?.latest?.medianCents;
    return c == null ? null : c / 100;
  };

  const complete = medianDollars('complete');
  const loose = medianDollars('cart_disc_only');
  const discAndCase = medianDollars('cart_disc_and_case');

  const base =
    complete ??
    loose ??
    discAndCase ??
    medianDollars('cart_disc_and_manual') ??
    medianDollars('manual_only') ??
    medianDollars('case_only');

  const looseOut = loose ?? (base != null ? base * 0.65 : null);
  const completeOut = complete ?? base;
  const cibOut = complete ?? base;

  return {
    loose: looseOut,
    complete: completeOut ?? looseOut,
    cib: cibOut ?? completeOut,
    new:
      completeOut != null
        ? completeOut * 1.25
        : looseOut != null
          ? looseOut * 1.4
          : base != null
            ? base * 1.25
            : null,
    dataQuality: pricing?.dataQuality ?? null,
  };
};

const hasAnyMedian = (pricing) =>
  (pricing?.buckets ?? []).some((b) => b.latest?.medianCents != null);

function requireGameDbBaseUrl() {
  if (!config.gameDbApiUrl) {
    throw new Error(
      'Game catalog is not configured: VITE_GAMEDB_API_URL was empty at build time. Add it under GitHub → Settings → Secrets and variables → Actions → Variables (or Secrets), then redeploy. Note: Azure Static Web Apps application settings do not replace this for Vite.'
    );
  }
}

/**
 * Search games by title (optional filters on api-gamedb: systemId, genre, etc.).
 * @param {string} query
 * @param {Object} authHeaders - Unused for gamedb (anonymous); kept for call-site compatibility.
 * @returns {Promise<Array>} Normalized games for the inventory UI
 */
export const searchGames = async (query, authHeaders = {}) => {
  if (!query || query.trim().length === 0) {
    return [];
  }

  requireGameDbBaseUrl();

  const params = new URLSearchParams({
    search: query.trim(),
    limit: '50',
    offset: '0',
  });
  const url = `${config.gameDbApiUrl}/games?${params.toString()}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
  });

  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const msg =
      payload?.message ||
      payload?.error ||
      payload?.errors?.[0] ||
      response.statusText ||
      'Failed to search games';
    throw new Error(msg);
  }

  const list = Array.isArray(payload) ? payload : payload?.data ?? [];
  return list.map(normalizeGameFromGameDb).filter(Boolean);
};

/**
 * Get game details by ID (from selected search result - no API call needed)
 * @param {string|number} gameId
 * @param {Array} searchResults
 * @returns {Object|null}
 */
export const getGameById = (gameId, searchResults = []) => {
  return searchResults.find((game) => String(game.id) === String(gameId)) || null;
};

/**
 * Market reference prices from api-gamedb eBay snapshots (GET /games/:id/pricing).
 * @param {string|number} gameId
 * @param {number} [trendDays]
 * @returns {Promise<Object|null>} { loose, complete, cib, new } in USD or null if unavailable
 */
export const getMarketPrices = async (gameId, trendDays = 7) => {
  requireGameDbBaseUrl();

  const params = new URLSearchParams({
    trendDays: String(Math.min(Math.max(Number(trendDays) || 7, 1), 90)),
  });
  const url = `${config.gameDbApiUrl}/games/${encodeURIComponent(String(gameId))}/pricing?${params}`;
  const response = await fetch(url);
  if (!response.ok) {
    return null;
  }
  const pricing = await response.json();
  if (!hasAnyMedian(pricing)) {
    return null;
  }
  return mapPricingResponseToLegacyPrices(pricing);
};
