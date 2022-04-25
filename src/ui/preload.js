const { contextBridge, ipcRenderer } = require('electron');

const $ = document.querySelector.bind(document);

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer
});

