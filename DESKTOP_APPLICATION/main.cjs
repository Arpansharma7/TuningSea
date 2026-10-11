const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const path = require('node:path');

ipcMain.handle('tuningsea:select-dataset', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Import training data',
    properties: ['openFile'],
    filters: [
      { name: 'Training data', extensions: ['jsonl', 'json', 'csv', 'txt'] }
    ]
  });

  if (result.canceled || !result.filePaths[0]) return null;
  const filePath = result.filePaths[0];
  return { path: filePath, name: path.basename(filePath) };
});

ipcMain.handle('tuningsea:select-storage', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Choose TuningSea storage location',
    properties: ['openDirectory', 'createDirectory']
  });
  return result.canceled ? null : result.filePaths[0] || null;
});

const createWindow = () => {
  const window = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 680,
    backgroundColor: '#151515',
    show: false,
    autoHideMenuBar: true,
    title: 'TuningSea Studio',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  window.once('ready-to-show', () => window.show());
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) shell.openExternal(url);
    return { action: 'deny' };
  });
  window.loadFile(path.join(__dirname, 'ui', 'index.html'));
};

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
