/**
 * API Endpoint: /api/update-item
 * Updates inventory item in Google Sheets
 */

const { updateInventoryItem } = require('../../lib/updateSheet');
const NodeCache = require('node-cache');

// Import the same cache instance from inventory.js
const cache = new NodeCache({ stdTTL: 7200 });

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { inventoryId, material, updates, username } = req.body;

    // Basic validation
    if (!inventoryId || !material || !updates) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!username) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    console.log(`Update request from ${username} for ${inventoryId} in ${material}`);

    // Update the item in Google Sheets
    await updateInventoryItem(inventoryId, material, updates);

    // Clear cache to force refresh
    cache.del('inventory_data');
    console.log('Cache cleared after update');

    return res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      inventoryId,
      material,
    });
  } catch (error) {
    console.error('Error in /api/update-item:', error);
    return res.status(500).json({
      error: 'Failed to update item',
      message: error.message,
    });
  }
}
