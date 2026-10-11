const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('tuningSeaDesktop', {
  platform: process.platform,
  versions: Object.freeze({
    electron: process.versions.electron,
    chrome: process.versions.chrome
  }),
  selectDataset: () => ipcRenderer.invoke('tuningsea:select-dataset'),
  selectStorageLocation: () => ipcRenderer.invoke('tuningsea:select-storage')
});
