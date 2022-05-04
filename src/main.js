const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require("path");
const patcher = require('./patcher');
const downloader = require("./downloader");
const { logger } = require('./logger');


/**
 * @type {BrowserWindow}
 */
let mainWindow;
app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 720,
    height: 452,
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
    icon: path.join(__dirname, 'resources/spinhat_v1.ico'),
  });

  // mainWindow.webContents.openDevTools({ mode: 'detach' });

  mainWindow.loadFile('ui/index.html');
});

ipcMain.on("minimize", () => {
  logger.info("minimized");
  mainWindow.minimize();
});

ipcMain.on("close", () => {
  logger.info("closed");
  mainWindow.close();
});


// Patcher stuff

ipcMain.handle("patch", async () => {
  logger.info("patching");
  return await patcher.patch();
});

ipcMain.handle("unpatch", async () => {
  logger.info("unpatching");
  return await patcher.unpatch();
});

ipcMain.handle("isPatched", async (event, ...args) => {
  logger.info("checking if patched");
  return await patcher.isPatched(...args);
});

// Git stuff

ipcMain.handle("getLocalCommit", async () => {
  logger.info("getting local commit hash");
  return await downloader.getLocalCommit();
});

ipcMain.handle("getRemoteCommit", async () => {
  logger.info("getting remote commit hash");
  return await downloader.getRemoteCommit();
});

ipcMain.handle("getChanges", async () => {
  logger.info("getting changes");
  return await downloader.getChanges();
});

// download stuff

ipcMain.handle("download", async (event, ...args) => {
  logger.info("downloading");
  try {
    // await downloader.download();
    return await downloader.download2.apply(downloader, args);
  } catch (e) {
    logger.error(e);
  }
});

ipcMain.handle("update", async (event, ...args) => {
  logger.info("updating");
  try {
    return await downloader.update.apply(downloader, args);
  } catch (err) {
    logger.error(err);
    throw err
  }
});

ipcMain.handle("uninstall", async (event, ...args) => {
  logger.info("uninstalling");
  try {
    return await downloader.uninstall.apply(downloader, args);
  } catch (err) {
    logger.error(err);
    throw err
  }
});

// Handle message boxes
// dialogs-showErrorBox

ipcMain.on("dialogs-showErrorBox", (event, title, content) => {
  logger.info(`showing error box: ${title} - ${content}`);
  dialog.showErrorBox(title, content);
});

ipcMain.on("dialogs-showMessageBox", (event, title, content) => {
  // logger.info(`showing message box: ${title} - ${content}`);
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: title,
    message: content,
    buttons: ['OK']
  });
});


// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit();
  }
})
