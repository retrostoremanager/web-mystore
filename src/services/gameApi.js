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
  // libretro-thumbnails per-system repos use underscores between tokens (e.g.
  // "Nintendo_-_Super_Nintendo_Entertainment_System"), not spaces.
  const repo = sys.replace(/ /g, '_');
  return `https://raw.githubusercontent.com/libretro-thumbnails/${repo}/master/Named_Boxarts/${encodeURIComponent(name)}.png`;
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

/**
 * Bulk-resolve trade-in line items to suggested store BUY (offer) prices via api-gamedb's
 * offer engine: POST /pricing/bulk-lookup returns the best catalog match per item with
 * loose/complete market value and a base-margin buy price. Results come back in input order.
 * @param {Array<{title:string, platform:string}>} items
 * @param {number} [margin] store buy margin 0-1 (omit to use the API's 0.50 default)
 * @returns {Promise<Array>} BulkLookupResultDto[] aligned to the (title-bearing) input order
 */
export const bulkLookupOffers = async (items, margin) => {
  requireGameDbBaseUrl();

  const payload = (items ?? [])
    .filter((it) => it && String(it.title ?? '').trim())
    .map((it) => ({
      title: String(it.title).trim(),
      platform: String(it.platform ?? '').trim(),
    }));
  if (payload.length === 0) return [];

  const qs = margin != null ? `?margin=${encodeURIComponent(String(margin))}` : '';
  const url = `${config.gameDbApiUrl}/pricing/bulk-lookup${qs}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    const msg =
      data?.message || data?.error || response.statusText || 'Failed to look up offer prices';
    throw new Error(msg);
  }

  return Array.isArray(data?.results) ? data.results : [];
};

/**
 * Pick a suggested store OFFER (buy price, in USD) from a bulk-lookup result, scaled by
 * trade-in condition. The API already returns market × buy-margin; condition shades between
 * the complete (CIB) and loose buy price since the trade-in grid doesn't capture completeness.
 * @param {object} result - one BulkLookupResultDto
 * @param {string} condition - 'poor' | 'fair' | 'good' | 'excellent'
 * @returns {number|null} suggested offer in USD, or null if the item has no priced snapshot
 */
export const suggestedOfferForCondition = (result, condition) => {
  if (!result || !result.matched) return null;

  const looseBuy = result.looseBuyCents != null ? result.looseBuyCents / 100 : null;
  const completeBuy = result.completeBuyCents != null ? result.completeBuyCents / 100 : null;
  if (looseBuy == null && completeBuy == null) return null;

  // Fill the missing end from the one we have (loose ~= 65% of complete).
  const complete = completeBuy ?? (looseBuy != null ? looseBuy / 0.65 : null);
  const loose = looseBuy ?? (completeBuy != null ? completeBuy * 0.65 : null);

  const byCondition = {
    excellent: complete ?? loose,
    good: complete != null ? complete * 0.85 : loose,
    fair: loose ?? (complete != null ? complete * 0.6 : null),
    poor: loose != null ? loose * 0.7 : complete != null ? complete * 0.45 : null,
  };

  const val = byCondition[String(condition || '').toLowerCase()] ?? loose ?? complete;
  if (val == null || !Number.isFinite(val)) return null;
  return Math.round(val * 100) / 100;
};

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
