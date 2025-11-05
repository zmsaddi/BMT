# Building Windows .exe File

This guide explains how to build a standalone Windows .exe file for the BMT Inventory System.

## Prerequisites

1. Node.js installed
2. All npm dependencies installed (`npm install`)
3. `.env.production` file with your Google Sheets credentials

## Important Notes

- The .exe file and build artifacts are automatically excluded from Git (see `.gitignore`)
- The web version on Vercel remains completely separate
- The .exe will NOT be pushed to GitHub

## Build Steps

### 1. First Time Setup

Make sure you have an icon file (optional but recommended):
- Place a `.png` file at `public/icon.png` (256x256px or larger)
- If you don't have an icon, the app will build without it

### 2. Build the .exe

Run one of these commands:

```bash
# Build the Next.js app and create Windows installer
npm run build-exe
```

This will:
1. Build the Next.js production bundle
2. Package everything with Electron
3. Create a Windows installer in the `dist/` folder

### 3. Find Your .exe

After building, you'll find:
- `dist/BMT Inventory System Setup 1.0.0.exe` - The installer
- The installer will be about 200-300 MB (includes Node.js runtime and all dependencies)

## Installation

1. Run the installer `.exe` file
2. Choose installation directory
3. The app will create desktop and start menu shortcuts
4. Launch the app from the shortcut

## How It Works

The .exe file contains:
- Full Node.js runtime
- Next.js application
- All dependencies
- Electron wrapper

When you run it:
1. Starts a local Next.js server on port 3000
2. Opens a desktop window showing the inventory system
3. Connects to Google Sheets API (requires internet)
4. Saves your login session locally

## Updating the App

To create a new version:
1. Make your code changes
2. Commit and push to GitHub (web version updates automatically)
3. Run `npm run build-exe` again to create a new .exe
4. Distribute the new installer to users

## Troubleshooting

### Build fails with "icon not found"
- Add an icon at `public/icon.png` OR
- Remove `"icon": "public/icon.png"` from `package.json` build config

### Port 3000 already in use
- Close any other apps using port 3000
- Or change the port in `electron/main.js` and restart

### Cannot connect to Google Sheets
- Make sure `.env.production` is in the project root
- Verify your Google Sheets credentials are correct
- Check your internet connection

## File Size

The installer will be approximately:
- **Installer**: 150-200 MB
- **Installed app**: 400-500 MB

This is normal for Electron apps as they include the entire runtime environment.

## Distribution

To share with other users:
1. Build the .exe using steps above
2. Find the installer in `dist/` folder
3. Share the `.exe` file via:
   - USB drive
   - Network share
   - File sharing service (Dropbox, Google Drive, etc.)
4. Users run the installer and install the app
5. They'll need to enter their login credentials (adolf/chadi with BMTADMIN password)

## Benefits of .exe Version

✅ No browser needed
✅ Runs as a standalone desktop app
✅ System tray integration
✅ Works offline (with cached data)
✅ Professional Windows application appearance
✅ Auto-updates available (can be configured)
✅ Desktop shortcuts
✅ Easy to distribute to employees

## Web Version vs Desktop Version

| Feature | Web (Vercel) | Desktop (.exe) |
|---------|--------------|----------------|
| Access | Browser + URL | Desktop app |
| Installation | None | One-time installer |
| Updates | Automatic | Manual rebuild |
| Internet | Required | Required |
| Distribution | Share URL | Share .exe file |
| Cost | Free (Vercel) | Free |

Both versions access the same Google Sheets data!
