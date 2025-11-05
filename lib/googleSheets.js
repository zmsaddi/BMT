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
  // Decode private key if it's base64 encoded
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  // Check if it's base64 encoded (doesn't start with -----)
  if (privateKey && !privateKey.startsWith('-----BEGIN')) {
    try {
      privateKey = Buffer.from(privateKey, 'base64').toString('utf-8');
    } catch (e) {
      console.error('Failed to decode base64 private key:', e);
    }
  }

  // Replace \n with actual newlines
  privateKey = privateKey.replace(/\\n/g, '\n');

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  return google.sheets({ version: 'v4', auth });
}

/**
 * Convert RGB color object to hex string
 */
function rgbToHex(rgb) {
  if (!rgb) return '#FFFFFF';
  const r = Math.round((rgb.red || 0) * 255);
  const g = Math.round((rgb.green || 0) * 255);
  const b = Math.round((rgb.blue || 0) * 255);
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

/**
 * Get color name from hex
 */
function getColorName(hex) {
  const colorMap = {
    '#FFFFFF': 'White',
    '#FF0000': 'Red',
    '#00FF00': 'Green',
    '#0000FF': 'Blue',
    '#FFFF00': 'Yellow',
    '#FFA500': 'Orange',
    '#FFC0CB': 'Pink',
    '#800080': 'Purple',
    '#808080': 'Gray',
    '#FFD700': 'Gold',
    '#00FFFF': 'Cyan',
    '#FF00FF': 'Magenta',
  };

  // Try exact match
  if (colorMap[hex.toUpperCase()]) {
    return colorMap[hex.toUpperCase()];
  }

  // Try approximate match
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  if (r > 200 && g < 100 && b < 100) return 'Red';
  if (r < 100 && g > 200 && b < 100) return 'Green';
  if (r < 100 && g < 100 && b > 200) return 'Blue';
  if (r > 200 && g > 200 && b < 100) return 'Yellow';
  if (r > 200 && g > 150 && b < 100) return 'Orange';
  if (r > 200 && g > 150 && b > 150) return 'Pink';
  if (r > 150 && g > 150 && b < 100) return 'Gold';
  if (r > 200 && g > 200 && b > 200) return 'White';
  if (r < 100 && g < 100 && b < 100) return 'Black';

  return hex;
}

/**
 * Fetch data from a specific sheet with cell colors
 * Original structure: A=ID, B=Thickness, C=Length, D=Width, E=Qty, F=Finish, G=Grade, H=Shelf, I=Notes
 * @param {string} sheetName - Name of the sheet (e.g., 'ST.STEEL')
 * @returns {Promise<Array>} Array of inventory items
 */
async function fetchSheetData(sheetName) {
  try {
    const sheets = getGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

    // First, get the sheet metadata to find the sheet ID
    const metadataResponse = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    const sheet = metadataResponse.data.sheets.find(
      s => s.properties.title === sheetName
    );

    if (!sheet) {
      throw new Error(`Sheet ${sheetName} not found`);
    }

    const sheetId = sheet.properties.sheetId;

    // Fetch data with formatting (rows 3-1000, columns A-I)
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
      ranges: [`${sheetName}!A3:I1000`],
      fields: 'sheets(data(rowData(values(userEnteredValue,effectiveFormat,textFormatRuns,hyperlink))))',
    });

    const sheetData = response.data.sheets[0]?.data[0];
    const rowData = sheetData?.rowData || [];

    // Transform rows into objects with color information
    const items = [];
    for (let i = 0; i < rowData.length; i++) {
      const row = rowData[i];
      const values = row.values || [];

      // Skip empty rows (no Inventory ID in column A)
      if (!values[0]?.userEnteredValue) continue;

      // Get background color from first cell (column A)
      const bgColor = values[0]?.effectiveFormat?.backgroundColor;
      const hexColor = rgbToHex(bgColor);
      const colorName = getColorName(hexColor);

      // Extract hyperlink from Inventory ID cell if it exists
      const inventoryIdCell = values[0];
      let inventoryIdLink = null;

      // Check for hyperlink in textFormatRuns
      if (inventoryIdCell?.textFormatRuns && inventoryIdCell.textFormatRuns.length > 0) {
        for (const run of inventoryIdCell.textFormatRuns) {
          if (run.format?.link?.uri) {
            inventoryIdLink = run.format.link.uri;
            break;
          }
        }
      }

      // Also check if the entire cell has a hyperlink formula
      if (!inventoryIdLink && inventoryIdCell?.hyperlink) {
        inventoryIdLink = inventoryIdCell.hyperlink;
      }

      items.push({
        inventoryId: values[0]?.userEnteredValue?.stringValue || values[0]?.userEnteredValue?.numberValue?.toString() || '',
        inventoryIdLink: inventoryIdLink,
        thickness: parseFloat(values[1]?.userEnteredValue?.numberValue || values[1]?.userEnteredValue?.stringValue) || 0,
        length: parseFloat(values[2]?.userEnteredValue?.numberValue || values[2]?.userEnteredValue?.stringValue) || 0,
        width: parseFloat(values[3]?.userEnteredValue?.numberValue || values[3]?.userEnteredValue?.stringValue) || 0,
        qty: parseInt(values[4]?.userEnteredValue?.numberValue || values[4]?.userEnteredValue?.stringValue) || 0,
        finish: values[5]?.userEnteredValue?.stringValue || values[5]?.userEnteredValue?.numberValue?.toString() || '',
        grade: values[6]?.userEnteredValue?.stringValue || values[6]?.userEnteredValue?.numberValue?.toString() || '',
        shelf: values[7]?.userEnteredValue?.stringValue || values[7]?.userEnteredValue?.numberValue?.toString() || '',
        notes: values[8]?.userEnteredValue?.stringValue || values[8]?.userEnteredValue?.numberValue?.toString() || '',
        material: sheetName,
        color: colorName,
        hexColor: hexColor,
      });
    }

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
  const colors = [...new Set(items.map(item => item.color).filter(Boolean))].sort();
  const inventoryIds = [...new Set(items.map(item => item.inventoryId).filter(Boolean))].sort();
  const thicknesses = [...new Set(items.map(item => item.thickness).filter(Boolean))].sort((a, b) => a - b);
  const lengths = [...new Set(items.map(item => item.length).filter(Boolean))].sort((a, b) => a - b);
  const widths = [...new Set(items.map(item => item.width).filter(Boolean))].sort((a, b) => a - b);
  const quantities = [...new Set(items.map(item => item.qty).filter(q => q !== null && q !== undefined))].sort((a, b) => a - b);

  return {
    materials,
    finishes,
    grades,
    shelves,
    colors,
    inventoryIds,
    thicknesses,
    lengths,
    widths,
    quantities,
  };
}

module.exports = {
  fetchAllInventory,
  fetchSheetData,
  getFilterOptions,
  SHEET_NAMES,
};
