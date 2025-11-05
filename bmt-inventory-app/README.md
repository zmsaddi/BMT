# BMT Inventory Viewer

Real-time inventory viewing system connected to Google Sheets.

## Features

- 📊 Real-time data from Google Sheets
- 🔍 Advanced filtering system
- 📱 Responsive design (works on mobile)
- ⚡ Fast caching (5-minute cache)
- 🔄 Auto-refresh every 5 minutes
- 🌐 Public access (no authentication required)

## Setup Instructions

### 1. Google Cloud Setup

#### Enable Google Sheets API:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project: "BMT Inventory API"
3. Enable Google Sheets API
4. Create a Service Account
5. Download the JSON credentials file

#### Share Google Sheet:
1. Open your Google Sheet
2. Click "Share"
3. Add the service account email (from JSON file)
4. Set permission to "Viewer"
5. Click "Send"

### 2. Local Development

#### Install dependencies:
```bash
npm install
```

#### Create `.env.local` file:
```bash
cp .env.local.example .env.local
```

#### Edit `.env.local` with your credentials:
```env
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----\n"
CACHE_DURATION=300
```

#### Run development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 3. Deploy to Vercel

#### Option A: Using Vercel CLI

Install Vercel CLI:
```bash
npm install -g vercel
```

Deploy:
```bash
vercel
```

Add environment variables in Vercel dashboard.

#### Option B: Using GitHub + Vercel Website

1. Push code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/zmsaddi/BMT.git
git push -u origin main
```

2. Go to [Vercel](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Add environment variables:
   - `GOOGLE_SHEETS_SPREADSHEET_ID`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
6. Click "Deploy"

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `GOOGLE_SHEETS_SPREADSHEET_ID` | ID from Google Sheets URL | `1ABC...XYZ` |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account email | `bmt@project.iam.gserviceaccount.com` |
| `GOOGLE_PRIVATE_KEY` | Private key from JSON file | `-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n` |
| `CACHE_DURATION` | Cache duration in seconds | `300` (5 minutes) |

## How to Get Spreadsheet ID

From your Google Sheets URL:
```
https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
                                        ^^^^^^^^^^^^^^^^
                                        Copy this part
```

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Next.js API Routes (Serverless Functions)
- **Data Source**: Google Sheets API
- **Caching**: node-cache
- **Deployment**: Vercel

## Features

### Filters
- Material Type (11 types)
- Finish
- Grade
- Shelf
- Quantity range (min/max)
- Search (across all fields)

### Auto-Refresh
- Data refreshes automatically every 5 minutes
- Manual refresh button available
- Last update timestamp shown

### Caching
- Server-side caching (5 minutes)
- Reduces API calls to Google Sheets
- Improves performance

## Support

For issues or questions, contact: admin@company.com

## License

Private - BMT Internal Use Only
