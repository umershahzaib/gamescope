const CHEAPSHARK_BASE_URL = 'https://www.cheapshark.com/api/1.0';

// Normalize game title for better matching
const normalizeTitle = (title) => {
  if (!title) return '';

  return title
    .toLowerCase()
    .trim()
    // Remove special editions and extra text in parentheses
    .replace(/\s*\([^)]*\)/g, '')
    // Remove special characters but keep spaces
    .replace(/[^\w\s]/g, '')
    // Normalize multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
};

// Search for game deals on CheapShark
export const searchGameDeals = async (gameTitle) => {
  if (!gameTitle) {
    return [];
  }

  try {
    const response = await fetch(
      `${CHEAPSHARK_BASE_URL}/games?title=${encodeURIComponent(gameTitle)}&limit=5`
    );

    if (!response.ok) {
      console.warn('CheapShark API error:', response.status);
      return [];
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('CheapShark search error:', error);
    return [];
  }
};

// Find best matching game from CheapShark results
export const findBestMatch = (searchResults, targetTitle) => {
  if (!searchResults || searchResults.length === 0 || !targetTitle) {
    return null;
  }

  const normalizedTarget = normalizeTitle(targetTitle);

  // Find exact match first
  const exactMatch = searchResults.find(game =>
    normalizeTitle(game.external) === normalizedTarget
  );

  if (exactMatch) {
    return exactMatch;
  }

  // Find closest match by checking if normalized titles contain each other
  const closeMatch = searchResults.find(game => {
    const normalized = normalizeTitle(game.external);
    return normalized.includes(normalizedTarget) || normalizedTarget.includes(normalized);
  });

  return closeMatch || null;
};

// Get deal details by game ID
export const getGameDeals = async (gameID) => {
  if (!gameID) {
    return [];
  }

  try {
    const response = await fetch(
      `${CHEAPSHARK_BASE_URL}/games?id=${gameID}`
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data?.deals || [];
  } catch (error) {
    console.error('CheapShark deal details error:', error);
    return [];
  }
};

// Get store list
export const getStoreList = async () => {
  try {
    const response = await fetch(`${CHEAPSHARK_BASE_URL}/stores`);

    if (!response.ok) {
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error('CheapShark stores error:', error);
    return [];
  }
};

// Parse pricing from CheapShark game data
export const parsePricing = (cheapsharkGame, deals = []) => {
  if (!cheapsharkGame) {
    return null;
  }

  const pricing = {
    prices: [],
    cheapestPrice: null,
    cheapestStore: null,
  };

  // Parse cheapest price from main game data
  if (cheapsharkGame.cheapest) {
    const cheapestPrice = parseFloat(cheapsharkGame.cheapest);

    if (!isNaN(cheapestPrice)) {
      pricing.cheapestPrice = cheapestPrice;

      // If we have deals, find the store name
      if (deals && deals.length > 0) {
        const cheapestDeal = deals.find(deal =>
          parseFloat(deal.price) === cheapestPrice
        );

        if (cheapestDeal) {
          pricing.cheapestStore = getStoreName(cheapestDeal.storeID);

          pricing.prices.push({
            storeName: pricing.cheapestStore,
            storeID: cheapestDeal.storeID,
            salePrice: cheapestPrice,
            originalPrice: parseFloat(cheapestDeal.retailPrice) || null,
            savings: parseFloat(cheapestDeal.savings) || 0,
            dealUrl: `https://www.cheapshark.com/redirect?dealID=${cheapestDeal.dealID}`,
          });
        }
      }
    }
  }

  // Add other store prices from deals
  deals.forEach(deal => {
    const salePrice = parseFloat(deal.price);
    const originalPrice = parseFloat(deal.retailPrice);
    const savings = parseFloat(deal.savings);

    if (!isNaN(salePrice)) {
      const storeName = getStoreName(deal.storeID);

      // Skip if already added as cheapest
      const alreadyAdded = pricing.prices.some(p => p.storeID === deal.storeID);

      if (!alreadyAdded) {
        pricing.prices.push({
          storeName,
          storeID: deal.storeID,
          salePrice,
          originalPrice: !isNaN(originalPrice) ? originalPrice : null,
          savings: !isNaN(savings) ? savings : 0,
          dealUrl: `https://www.cheapshark.com/redirect?dealID=${deal.dealID}`,
        });
      }
    }
  });

  return pricing.prices.length > 0 ? pricing : null;
};

// Map CheapShark store IDs to names
const getStoreName = (storeID) => {
  const storeMap = {
    '1': 'Steam',
    '2': 'GamersGate',
    '3': 'GreenManGaming',
    '7': 'GOG',
    '8': 'Origin',
    '11': 'Humble Store',
    '13': 'Uplay',
    '15': 'Fanatical',
    '25': 'Epic Games Store',
    '27': 'Gamesplanet',
    '28': 'Gamesload',
    '29': 'GameBillet',
    '30': 'IndieGala',
  };

  return storeMap[storeID] || `Store ${storeID}`;
};

// Get pricing for a game by title
export const getGamePricing = async (gameTitle) => {
  try {
    // Search for the game
    const searchResults = await searchGameDeals(gameTitle);

    if (!searchResults || searchResults.length === 0) {
      return null;
    }

    // Find best match
    const bestMatch = findBestMatch(searchResults, gameTitle);

    if (!bestMatch) {
      return null;
    }

    // Get detailed deals for the matched game
    const deals = await getGameDeals(bestMatch.gameID);

    // Parse pricing information
    return parsePricing(bestMatch, deals);
  } catch (error) {
    console.error('Get game pricing error:', error);
    return null;
  }
};

export default {
  searchGameDeals,
  findBestMatch,
  getGameDeals,
  getGamePricing,
  parsePricing,
  getStoreList,
};
