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
const isDev = !app.isPackaged;

// Get the correct paths for packaged app
const appPath = isDev ? path.join(__dirname, '..') : process.resourcesPath;

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
    icon: path.join(appPath, 'public/icon.png'),
    title: 'BMT Inventory System',
  });

  // Load the Next.js app
  mainWindow.loadURL('http://localhost:3000');

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Handle window closed
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

function startNextServer() {
  return new Promise((resolve) => {
    console.log('Starting Next.js server...');
    console.log('App path:', appPath);
    console.log('Is packaged:', app.isPackaged);

    // In packaged app, use node.exe from the app directory
    let nodePath, nextPath, workingDir;

    if (app.isPackaged) {
      // Packaged app paths
      nodePath = process.execPath; // Use Electron's node
      nextPath = path.join(process.resourcesPath, 'app', 'node_modules', 'next', 'dist', 'bin', 'next');
      workingDir = path.join(process.resourcesPath, 'app');
    } else {
      // Development paths
      nodePath = process.execPath;
      nextPath = path.join(__dirname, '..', 'node_modules', 'next', 'dist', 'bin', 'next');
      workingDir = path.join(__dirname, '..');
    }

    console.log('Node path:', nodePath);
    console.log('Next path:', nextPath);
    console.log('Working dir:', workingDir);

    // Start Next.js using node directly
    nextServer = spawn(process.execPath, [nextPath, 'start', '-p', '3000'], {
      cwd: workingDir,
      env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: '3000'
      },
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true
    });

    nextServer.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`Next.js: ${output}`);
      if (output.includes('Ready') || output.includes('started server') || output.includes('Local:')) {
        console.log('Next.js server is ready!');
        resolve();
      }
    });

    nextServer.stderr.on('data', (data) => {
      console.error(`Next.js Error: ${data.toString()}`);
    });

    nextServer.on('error', (error) => {
      console.error('Failed to start Next.js server:', error);
      resolve(); // Resolve anyway to show error in window
    });

    nextServer.on('close', (code) => {
      console.log(`Next.js server exited with code ${code}`);
    });

    // Wait 5 seconds and resolve anyway
    setTimeout(() => {
      console.log('Timeout reached, proceeding to open window...');
      resolve();
    }, 5000);
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(async () => {
  console.log('Starting BMT Inventory System...');
  console.log('Electron version:', process.versions.electron);
  console.log('Node version:', process.versions.node);

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
    console.log('Killing Next.js server...');
    nextServer.kill();
  }

  // On macOS it is common for applications to stay open until the user quits explicitly
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  // Kill the Next.js server
  if (nextServer) {
    console.log('Killing Next.js server on quit...');
    nextServer.kill();
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});
