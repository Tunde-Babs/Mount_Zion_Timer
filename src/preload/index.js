const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Presenter window operations
  openPresenter: () => ipcRenderer.invoke('open-presenter'),
  closePresenter: () => ipcRenderer.invoke('close-presenter'),
  updatePresenter: (data) => ipcRenderer.invoke('update-presenter', data),
  isPresenterOpen: () => ipcRenderer.invoke('is-presenter-open'),
  
  // Listen for presenter closed event
  onPresenterClosed: (callback) => {
    ipcRenderer.on('presenter-closed', () => callback());
  },
  
  // Listen for timer updates (for presenter window)
  onTimerUpdate: (callback) => {
    ipcRenderer.on('timer-update', (event, data) => callback(data));
  },
  
  // Get display information
  getDisplays: () => ipcRenderer.invoke('get-displays'),
  
  // Storage operations
  storeGet: (key) => ipcRenderer.invoke('store-get', key),
  storeSet: (key, value) => ipcRenderer.invoke('store-set', key, value),
  storeDelete: (key) => ipcRenderer.invoke('store-delete', key),
  
  // Platform info
  platform: process.platform,
  isElectron: true
});

// Expose storage API compatible with web storage interface
contextBridge.exposeInMainWorld('storage', {
  get: async (key) => {
    try {
      const value = await ipcRenderer.invoke('store-get', key);
      return value !== undefined ? { key, value: JSON.stringify(value) } : null;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  },
  set: async (key, value) => {
    try {
      const parsed = JSON.parse(value);
      await ipcRenderer.invoke('store-set', key, parsed);
      return { key, value };
    } catch (error) {
      console.error('Storage set error:', error);
      return null;
    }
  },
  delete: async (key) => {
    try {
      await ipcRenderer.invoke('store-delete', key);
      return { key, deleted: true };
    } catch (error) {
      console.error('Storage delete error:', error);
      return null;
    }
  }
});
