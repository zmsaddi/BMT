/**
 * Update Google Sheets Helper
 * Updates inventory data in Google Sheets
 */

const { google } = require('googleapis');

/**
 * Initialize Google Sheets API client with write access
 */
function getGoogleSheetsClient() {
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (privateKey && !privateKey.startsWith('-----BEGIN')) {
    try {
      privateKey = Buffer.from(privateKey, 'base64').toString('utf-8');
    } catch (e) {
      console.error('Failed to decode base64 private key:', e);
    }
  }

  privateKey = privateKey.replace(/\\n/g, '\n');

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

/**
 * Convert hex color to RGB object for Google Sheets
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    red: parseInt(result[1], 16) / 255,
    green: parseInt(result[2], 16) / 255,
    blue: parseInt(result[3], 16) / 255,
  } : null;
}

/**
 * Find row number for a specific inventory item
 * @param {string} inventoryId - Inventory ID to search for
 * @param {string} material - Material/sheet name
 * @returns {Promise<number>} Row number (0-indexed from row 3)
 */
async function findItemRow(inventoryId, material) {
  try {
    const sheets = getGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${material}!A3:A1000`,
    });

    const rows = response.data.values || [];

    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] === inventoryId) {
        return i + 3; // +3 because data starts at row 3
      }
    }

    throw new Error(`Item ${inventoryId} not found in sheet ${material}`);
  } catch (error) {
    console.error(`Error finding item row:`, error);
    throw error;
  }
}

/**
 * Update inventory item in Google Sheets
 * @param {string} inventoryId - Inventory ID
 * @param {string} material - Material/sheet name
 * @param {Object} updates - Fields to update
 * @returns {Promise<boolean>} Success status
 */
async function updateInventoryItem(inventoryId, material, updates) {
  try {
    const sheets = getGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

    console.log(`Updating item ${inventoryId} in ${material}...`);

    // Find the row number
    const rowNumber = await findItemRow(inventoryId, material);

    console.log(`Found item at row ${rowNumber}`);

    // Prepare update requests
    const requests = [];

    // Column mapping: B=Thickness, C=Length, D=Width, E=Qty, F=Finish, G=Grade, H=Shelf, I=Notes
    const columnMap = {
      thickness: 'B',
      length: 'C',
      width: 'D',
      qty: 'E',
      finish: 'F',
      grade: 'G',
      shelf: 'H',
      notes: 'I',
    };

    // Update cell values
    const valueUpdates = [];
    for (const [field, column] of Object.entries(columnMap)) {
      if (updates.hasOwnProperty(field)) {
        valueUpdates.push({
          range: `${material}!${column}${rowNumber}`,
          values: [[updates[field]]],
        });
      }
    }

    if (valueUpdates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        resource: {
          valueInputOption: 'USER_ENTERED',
          data: valueUpdates,
        },
      });
    }

    // Update background color if provided (apply to columns A-I)
    if (updates.hexColor) {
      const rgb = hexToRgb(updates.hexColor);
      if (rgb) {
        // Get sheet ID
        const metadataResponse = await sheets.spreadsheets.get({
          spreadsheetId,
        });

        const sheet = metadataResponse.data.sheets.find(
          s => s.properties.title === material
        );

        if (sheet) {
          const sheetId = sheet.properties.sheetId;

          // Apply color to columns A through I (columns 0-8)
          requests.push({
            repeatCell: {
              range: {
                sheetId: sheetId,
                startRowIndex: rowNumber - 1,
                endRowIndex: rowNumber,
                startColumnIndex: 0,  // Column A
                endColumnIndex: 9,    // Up to and including column I (0-8 = A-I)
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: rgb,
                },
              },
              fields: 'userEnteredFormat.backgroundColor',
            },
          });

          await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            resource: { requests },
          });
        }
      }
    }

    console.log(`Successfully updated item ${inventoryId}`);
    return true;
  } catch (error) {
    console.error(`Error updating inventory item:`, error);
    throw error;
  }
}

module.exports = {
  updateInventoryItem,
};
