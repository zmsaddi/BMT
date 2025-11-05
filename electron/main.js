/**
 * Electron Main Process
 * This file runs the Next.js app in a desktop window
 */

const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let nextServer;

// Check if running in development or production
const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
    icon: path.join(__dirname, '../public/icon.png'),
    title: 'BMT Inventory System',
  });

  // Load the Next.js app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL('http://localhost:3000');
  }

  // Handle window closed
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

function startNextServer() {
  return new Promise((resolve) => {
    // Start Next.js server
    const nextBin = path.join(__dirname, '../node_modules/.bin/next' + (process.platform === 'win32' ? '.cmd' : ''));

    nextServer = spawn(nextBin, ['start', '-p', '3000'], {
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, NODE_ENV: 'production' },
      shell: true,
    });

    nextServer.stdout.on('data', (data) => {
      console.log(`Next.js: ${data}`);
      if (data.toString().includes('Ready')) {
        resolve();
      }
    });

    nextServer.stderr.on('data', (data) => {
      console.error(`Next.js Error: ${data}`);
    });

    // Wait 3 seconds and resolve anyway
    setTimeout(resolve, 3000);
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(async () => {
  console.log('Starting BMT Inventory System...');

  // Start Next.js server first
  await startNextServer();

  // Then create the window
  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed
app.on('window-all-closed', function () {
  // Kill the Next.js server
  if (nextServer) {
    nextServer.kill();
  }

  // On macOS it is common for applications to stay open until the user quits explicitly
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  // Kill the Next.js server
  if (nextServer) {
    nextServer.kill();
  }
});
