/**
 * Google Sheets API Helper
 * Fetches inventory data from Google Sheets (Original structure - no STATUS column)
 */

const { google } = require('googleapis');

// Sheet names (11 material types)
const SHEET_NAMES = [
  'ST.STEEL',
  'STEEL',
  'GALVANIZED',
  'ZINCOR',
  'ALUMINIUM',
  'BRASS',
  'COPPER',
  'ALUMINIUM PPTD',
  'PLEXI',
  'SKINPLATE',
  'ACP'
];

/**
 * Initialize Google Sheets API client
 */
function getGoogleSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  return google.sheets({ version: 'v4', auth });
}

/**
 * Fetch data from a specific sheet
 * Original structure: A=ID, B=Thickness, C=Length, D=Width, E=Qty, F=Finish, G=Grade, H=Shelf, I=Notes
 * @param {string} sheetName - Name of the sheet (e.g., 'ST.STEEL')
 * @returns {Promise<Array>} Array of inventory items
 */
async function fetchSheetData(sheetName) {
  try {
    const sheets = getGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

    // Fetch data from A3:I1000 (skip header rows 1-2)
    const range = `${sheetName}!A3:I1000`;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values || [];

    // Transform rows into objects (original structure without STATUS)
    const items = rows
      .filter(row => row[0]) // Filter out empty rows (no Inventory ID)
      .map(row => ({
        inventoryId: row[0] || '',
        thickness: parseFloat(row[1]) || 0,
        length: parseFloat(row[2]) || 0,
        width: parseFloat(row[3]) || 0,
        qty: parseInt(row[4]) || 0,
        finish: row[5] || '',
        grade: row[6] || '',
        shelf: row[7] || '',
        notes: row[8] || '',
        material: sheetName, // Add material type
      }));

    return items;
  } catch (error) {
    console.error(`Error fetching data from ${sheetName}:`, error);
    throw error;
  }
}

/**
 * Fetch all inventory data from all sheets
 * @returns {Promise<Array>} Array of all inventory items
 */
async function fetchAllInventory() {
  try {
    // Fetch all sheets in parallel
    const promises = SHEET_NAMES.map(sheetName => fetchSheetData(sheetName));
    const results = await Promise.all(promises);

    // Flatten the array of arrays into a single array
    const allItems = results.flat();

    return allItems;
  } catch (error) {
    console.error('Error fetching all inventory:', error);
    throw error;
  }
}

/**
 * Get unique values for filters
 * @param {Array} items - Array of inventory items
 * @returns {Object} Object with unique values for each filter
 */
function getFilterOptions(items) {
  const materials = [...new Set(items.map(item => item.material))].sort();
  const finishes = [...new Set(items.map(item => item.finish).filter(Boolean))].sort();
  const grades = [...new Set(items.map(item => item.grade).filter(Boolean))].sort();
  const shelves = [...new Set(items.map(item => item.shelf).filter(Boolean))].sort();

  return {
    materials,
    finishes,
    grades,
    shelves,
  };
}

module.exports = {
  fetchAllInventory,
  fetchSheetData,
  getFilterOptions,
  SHEET_NAMES,
};
