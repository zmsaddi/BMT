/**
 * API Endpoint: /api/inventory
 * Fetches inventory data from Google Sheets with caching
 */

const NodeCache = require('node-cache');
const { fetchAllInventory, getFilterOptions } = require('../../lib/googleSheets');

// Cache for 2 hours (7200 seconds) - optimized for production
const cache = new NodeCache({ stdTTL: 7200 });

export default async function handler(req, res) {
  // Enable CORS for public access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const cacheKey = 'inventory_data';

    // Check if manual refresh is requested
    const forceRefresh = req.query.refresh === 'true';

    if (forceRefresh) {
      console.log('Manual refresh requested - clearing cache');
      cache.del(cacheKey);
    }

    // Check if we have cached data
    let data = cache.get(cacheKey);

    if (!data) {
      console.log('Cache miss - fetching from Google Sheets...');

      // Fetch fresh data from Google Sheets
      const items = await fetchAllInventory();
      const filterOptions = getFilterOptions(items);

      data = {
        items,
        filterOptions,
        count: items.length,
        lastUpdated: new Date().toISOString(),
      };

      // Store in cache
      cache.set(cacheKey, data);
      console.log(`Cached ${items.length} items`);
    } else {
      console.log('Cache hit - returning cached data');
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error in /api/inventory:', error);
    return res.status(500).json({
      error: 'Failed to fetch inventory data',
      message: error.message,
    });
  }
}
