import { getGamePricing } from './cheapsharkService';
import { extractPCRequirements } from '../utils/requirementsParser';

const API_KEY = import.meta.env.VITE_RAWG_API_KEY;
const BASE_URL = 'https://api.rawg.io/api';

// Check if API key is configured
if (!API_KEY) {
  console.warn('RAWG API key not configured. Please add VITE_RAWG_API_KEY to your .env file');
}

// Map UI categories to RAWG genre slugs
const GENRE_MAP = {
  'All': null,
  'Action': 'action',
  'RPG': 'role-playing-games-rpg',
  'FPS': 'shooter',
  'Adventure': 'adventure',
  'Strategy': 'strategy',
  'Simulation': 'simulation',
  'Sports': 'sports',
  'Racing': 'racing',
  'Horror': 'horror',
};

// Normalize API game data to match local game format
const normalizeGame = async (apiGame, includePricing = true) => {
  // Extract store links from RAWG API
  const stores = {};

  if (apiGame.stores && Array.isArray(apiGame.stores)) {
    apiGame.stores.forEach(storeData => {
      const store = storeData.store;
      const storeId = store?.id;
      const storeDomain = store?.domain;

      // Steam (ID: 1)
      if (storeId === 1 && storeDomain === 'store.steampowered.com') {
        stores.steam = {
          url: `https://store.steampowered.com/app/${apiGame.id}`,
          id: storeId
        };
      }

      // Epic Games Store (ID: 11)
      if (storeId === 11 && storeDomain === 'epicgames.com') {
        // Epic URLs need special handling - use the slug from API
        if (apiGame.slug) {
          stores.epic = {
            url: `https://store.epicgames.com/en-US/p/${apiGame.slug}`,
            id: storeId
          };
        }
      }
    });
  }

  // Extract PC requirements from platforms
  const pcRequirements = extractPCRequirements(apiGame);

  // Get pricing from CheapShark if requested
  let pricing = null;
  if (includePricing && apiGame.name) {
    try {
      pricing = await getGamePricing(apiGame.name);
    } catch (error) {
      console.warn('Failed to fetch pricing:', error);
      pricing = null;
    }
  }

  return {
    id: apiGame.id,
    title: apiGame.name,
    description: apiGame.description_raw || apiGame.description || '',
    image: apiGame.background_image || '',
    rating: apiGame.rating || apiGame.metacritic ? apiGame.metacritic / 10 : 0,
    price: 0, // Legacy field - now use pricing object
    releaseDate: apiGame.released || '',
    developer: apiGame.developers?.[0]?.name || 'Unknown',
    publisher: apiGame.publishers?.[0]?.name || 'Unknown',
    platforms: apiGame.platforms?.map(p => p.platform.name) || [],
    genre: apiGame.genres?.[0]?.name || 'Unknown',
    genres: apiGame.genres?.map(g => g.name) || [],
    tags: apiGame.tags?.slice(0, 5).map(t => t.name) || [],
    canRun: 'medium', // Default value since API doesn't provide this
    minimumRequirements: pcRequirements.minimum,
    recommendedRequirements: pcRequirements.recommended,
    stores: Object.keys(stores).length > 0 ? stores : undefined,
    pricing: pricing, // CheapShark pricing data
  };
};

// Search games by query
export const searchGames = async (query, page = 1, pageSize = 20) => {
  if (!API_KEY) {
    throw new Error('API key not configured');
  }

  if (!query || query.length < 2) {
    return { results: [], count: 0 };
  }

  try {
    const response = await fetch(
      `${BASE_URL}/games?key=${API_KEY}&search=${encodeURIComponent(query)}&page=${page}&page_size=${pageSize}`
    );

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Normalize games without pricing for search results (faster)
    const results = await Promise.all(
      data.results.map(game => normalizeGame(game, false))
    );

    return {
      results,
      count: data.count,
      next: data.next,
      previous: data.previous,
    };
  } catch (error) {
    console.error('Search games error:', error);
    throw error;
  }
};

// Get game details by ID
export const getGameDetails = async (gameId) => {
  if (!API_KEY) {
    throw new Error('API key not configured');
  }

  try {
    const response = await fetch(
      `${BASE_URL}/games/${gameId}?key=${API_KEY}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Game not found');
      }
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    // Include pricing for game details page
    return await normalizeGame(data, true);
  } catch (error) {
    console.error('Get game details error:', error);
    throw error;
  }
};

// Get game screenshots
export const getGameScreenshots = async (gameId) => {
  if (!API_KEY) {
    return [];
  }

  try {
    const response = await fetch(
      `${BASE_URL}/games/${gameId}/screenshots?key=${API_KEY}`
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.results.map(s => s.image);
  } catch (error) {
    console.error('Get screenshots error:', error);
    return [];
  }
};

// Get popular games
export const getPopularGames = async (page = 1, pageSize = 10) => {
  if (!API_KEY) {
    throw new Error('API key not configured');
  }

  try {
    const response = await fetch(
      `${BASE_URL}/games?key=${API_KEY}&ordering=-rating&page=${page}&page_size=${pageSize}`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Normalize games without pricing for list view
    const results = await Promise.all(
      data.results.map(game => normalizeGame(game, false))
    );

    return {
      results,
      count: data.count,
    };
  } catch (error) {
    console.error('Get popular games error:', error);
    throw error;
  }
};

// List of 40 famous games with their RAWG slugs for consistent homepage display
const FEATURED_GAME_SLUGS = [
  // Action / Open World
  'grand-theft-auto-v',
  'red-dead-redemption-2',
  'cyberpunk-2077',
  'the-witcher-3-wild-hunt',
  'elden-ring',
  'hogwarts-legacy',
  'assassins-creed-valhalla',
  'marvels-spider-man-remastered',

  // FPS / Shooter
  'counter-strike-2',
  'valorant',
  'call-of-duty-warzone',
  'doom-eternal',
  'battlefield-1',
  'battlefield-v',
  'apex-legends',
  'playerunknowns-battlegrounds',

  // Racing
  'forza-horizon-5',
  'forza-horizon-4',
  'need-for-speed-heat',
  'need-for-speed-unbound',
  'assetto-corsa-competizione',
  'f1-2024',

  // Sports
  'efootball-2024',
  'ea-sports-fc-24',
  'nba-2k24',
  'cricket-24',

  // Survival / Adventure
  'minecraft',
  'subnautica',
  'sons-of-the-forest',
  'rust',
  'terraria',
  'ark-survival-evolved',

  // RPG / Strategy / Other
  'baldurs-gate-iii',
  'diablo-iv',
  'sid-meiers-civilization-vi',
  'red-dead-redemption',
  'god-of-war',
  'horizon-zero-dawn-complete-edition',
  'sekiro-shadows-die-twice',
  'black-myth-wukong'
];

// Get homepage featured games (40 popular titles)
export const getFeaturedHomepageGames = async () => {
  if (!API_KEY) {
    throw new Error('API key not configured');
  }

  try {
    // Fetch games in batches to avoid overwhelming the API
    const batchSize = 10;
    const batches = [];

    for (let i = 0; i < FEATURED_GAME_SLUGS.length; i += batchSize) {
      const batch = FEATURED_GAME_SLUGS.slice(i, i + batchSize);
      batches.push(batch);
    }

    const allGames = [];

    for (const batch of batches) {
      const batchPromises = batch.map(async (slug) => {
        try {
          const response = await fetch(
            `${BASE_URL}/games/${slug}?key=${API_KEY}`
          );

          if (!response.ok) {
            console.warn(`Failed to fetch game: ${slug}`);
            return null;
          }

          const data = await response.json();
          return await normalizeGame(data, false); // Don't fetch pricing for homepage (performance)
        } catch (error) {
          console.warn(`Error fetching game ${slug}:`, error);
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      allGames.push(...batchResults.filter(game => game !== null));

      // Small delay between batches to avoid rate limiting
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    return allGames;
  } catch (error) {
    console.error('Get featured homepage games error:', error);
    throw error;
  }
};

// Get genres list
export const getGenres = async () => {
  if (!API_KEY) {
    return [];
  }

  try {
    const response = await fetch(
      `${BASE_URL}/genres?key=${API_KEY}`
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.results.map(g => g.name);
  } catch (error) {
    console.error('Get genres error:', error);
    return [];
  }
};

// Get games by genre/category
export const getGamesByGenre = async (category, page = 1, pageSize = 40) => {
  if (!API_KEY) {
    throw new Error('API key not configured');
  }

  try {
    // Get the RAWG genre slug from our category map
    const genreSlug = GENRE_MAP[category];

    let url;
    if (!genreSlug || category === 'All') {
      // Fetch popular games for "All" category
      url = `${BASE_URL}/games?key=${API_KEY}&ordering=-rating&page=${page}&page_size=${pageSize}&platforms=4`;
    } else {
      // Fetch games by specific genre
      url = `${BASE_URL}/games?key=${API_KEY}&genres=${genreSlug}&page=${page}&page_size=${pageSize}&platforms=4`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Normalize games without pricing for list view (performance)
    const results = await Promise.all(
      data.results.map(game => normalizeGame(game, false))
    );

    return {
      results,
      count: data.count,
      next: data.next,
      previous: data.previous,
    };
  } catch (error) {
    console.error('Get games by genre error:', error);
    throw error;
  }
};

export default {
  searchGames,
  getGameDetails,
  getGameScreenshots,
  getPopularGames,
  getFeaturedHomepageGames,
  getGenres,
  getGamesByGenre,
};
