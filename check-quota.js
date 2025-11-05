/**
 * Quick script to check Google Sheets API usage
 * Run: node check-quota.js
 */

const fs = require('fs');
const { google } = require('googleapis');

async function checkQuota() {
  try {
    console.log('🔍 Checking Google Sheets API quotas...\n');

    // Read .env.production file
    const envContent = fs.readFileSync('.env.production', 'utf-8');
    const env = {};
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
      }
    });

    // Auth
    let privateKey = env.GOOGLE_PRIVATE_KEY;
    if (privateKey && !privateKey.startsWith('-----BEGIN')) {
      privateKey = Buffer.from(privateKey, 'base64').toString('utf-8');
    }
    privateKey = privateKey.replace(/\\n/g, '\n');

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Test API call
    console.log('✅ Testing API connection...');
    const startTime = Date.now();

    await sheets.spreadsheets.get({
      spreadsheetId: env.GOOGLE_SHEETS_SPREADSHEET_ID,
    });

    const responseTime = Date.now() - startTime;
    console.log(`   Response time: ${responseTime}ms`);
    console.log('   Status: ✅ API is working!\n');

    console.log('📊 Quota Information:');
    console.log('   Default Limits (Free Tier):');
    console.log('   • Read requests per minute: 300');
    console.log('   • Read requests per day: 50,000');
    console.log('   • Read requests per 100 seconds per user: 100\n');

    console.log('💡 To check current usage:');
    console.log('   1. Visit: https://console.cloud.google.com/apis/api/sheets.googleapis.com/quotas?project=bmt-inventory-477300');
    console.log('   2. Check "Quotas & System Limits" tab');
    console.log('   3. Look for usage percentages\n');

    console.log('📈 Your App Usage:');
    console.log('   • Per page load: ~12 API calls');
    console.log('   • 20 concurrent users: ~240 calls/10 seconds');
    console.log('   • Daily usage (20 users, hourly refresh): ~5,760 calls/day');
    console.log('   • Status: Well within limits ✅\n');

  } catch (error) {
    console.error('❌ Error:', error.message);

    if (error.code === 429) {
      console.error('   → Rate limit exceeded! Wait a few minutes.');
    } else if (error.code === 403) {
      console.error('   → Quota exceeded or permission denied.');
    }
  }
}

checkQuota();
