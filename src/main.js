const { app, BrowserWindow, ipcMain } = require('electron');
const path = require("path");
const patcher = require('./patcher');
/**
 * @type {BrowserWindow}
 */
let mainWindow;
app.on('ready', () => {
  const sizeScale = [452,464]
  mainWindow = new BrowserWindow({
    width: sizeScale[0],
    height: sizeScale[1],
    webPreferences: {
      devTools: true,
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'ui/preload.js')
    },
    autoHideMenuBar: true,
    title: "SpinHat Patcher",
    frame:false,
    resizable:false,
    maximizable:false,
    transparent:true,
    modal:true,
  });

  mainWindow.webContents.openDevTools({ mode: 'detach' });

  mainWindow.loadFile('ui/index.html');
});

ipcMain.on("minimize", () => {
  console.log("minimized");
  mainWindow.minimize();
});

ipcMain.on("close", () => {
  console.log("closed");
  mainWindow.close();
});

ipcMain.handle("getPatchStatus", () => {
  return patcher.is();
})

ipcMain.on("patch", () => {
  console.log("patching");
  mainWindow.webContents.send("patching");

});

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit();
  }
})
