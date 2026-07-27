const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');

let mainWindow = null;
let presenterWindow = null;

// Determine if we're in development
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    title: 'Mount Zion Timer - Control Panel',
    icon: path.join(__dirname, '../../assets/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/index.js')
    },
    backgroundColor: '#030712',
    show: false
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    // Close presenter window if main window is closed
    if (presenterWindow && !presenterWindow.isDestroyed()) {
      presenterWindow.close();
    }
  });
}

function createPresenterWindow() {
  // Get all displays
  const displays = screen.getAllDisplays();
  
  // Try to find an external display, otherwise use primary
  const externalDisplay = displays.find((display) => {
    return display.bounds.x !== 0 || display.bounds.y !== 0;
  });

  const targetDisplay = externalDisplay || displays[0];

  presenterWindow = new BrowserWindow({
    x: targetDisplay.bounds.x,
    y: targetDisplay.bounds.y,
    width: targetDisplay.bounds.width,
    height: targetDisplay.bounds.height,
    fullscreen: true,
    title: 'Mount Zion Timer - Presenter View',
    icon: path.join(__dirname, '../../assets/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/index.js')
    },
    backgroundColor: '#059669',
    frame: false
  });

  // Load presenter view
  if (isDev) {
    presenterWindow.loadURL('http://localhost:5173/presenter.html');
  } else {
    presenterWindow.loadFile(path.join(__dirname, '../../dist/presenter.html'));
  }

  presenterWindow.on('closed', () => {
    presenterWindow = null;
    // Notify main window that presenter is closed
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('presenter-closed');
    }
  });

  // Allow ESC to exit fullscreen
  presenterWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'Escape') {
      presenterWindow.close();
    }
  });

  return presenterWindow;
}

// App ready
app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers

// Presenter window operations
ipcMain.handle('open-presenter', () => {
  if (!presenterWindow || presenterWindow.isDestroyed()) {
    createPresenterWindow();
    return true;
  } else {
    presenterWindow.focus();
    return false;
  }
});

ipcMain.handle('close-presenter', () => {
  if (presenterWindow && !presenterWindow.isDestroyed()) {
    presenterWindow.close();
    return true;
  }
  return false;
});

ipcMain.handle('update-presenter', (event, data) => {
  if (presenterWindow && !presenterWindow.isDestroyed()) {
    presenterWindow.webContents.send('timer-update', data);
    return true;
  }
  return false;
});

ipcMain.handle('is-presenter-open', () => {
  return presenterWindow && !presenterWindow.isDestroyed();
});

// Get display info
ipcMain.handle('get-displays', () => {
  return screen.getAllDisplays();
});

// Storage operations (using simple file-based storage)
const Store = require('electron-store');
const store = new Store({
  name: 'mount-zion-timer-data',
  defaults: {
    schedules: [],
    settings: {
      audioEnabled: true,
      volume: 0.7,
      soundType: 'gentle',
      warningAt60: true,
      warningAt30: true,
      alarmAtZero: true
    }
  }
});

ipcMain.handle('store-get', (event, key) => {
  return store.get(key);
});

ipcMain.handle('store-set', (event, key, value) => {
  store.set(key, value);
  return true;
});

ipcMain.handle('store-delete', (event, key) => {
  store.delete(key);
  return true;
});
