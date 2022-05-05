const { contextBridge, ipcRenderer } = require("electron");

const SpinHat = {
  patcher: {
    patch: async () => {
      return await ipcRenderer.invoke("patch");
    },
    unpatch: async () => {
      return await ipcRenderer.invoke("unpatch");
    },
    isPatched: async () => {
      return await ipcRenderer.invoke("isPatched");
    },
  },
  downloader: {
    download: async (...args) => {
      return await ipcRenderer.invoke("download", ...args);
    },
    update: async (...args) => {
      return await ipcRenderer.invoke("update", ...args);
    },
    uninstall: async (...args) => {
      return await ipcRenderer.invoke("uninstall", ...args);
    },
  },
  git: {
    getLocalCommit: async () => {
      return await ipcRenderer.invoke("getLocalCommit");
    },
    getRemoteCommit: async () => {
      return await ipcRenderer.invoke("getRemoteCommit");
    },
    getChanges: async () => {
      return await ipcRenderer.invoke("getChanges");
    },
  },
  window: {
    close: () => {
      ipcRenderer.send("close");
    },
    minimize: () => {
      ipcRenderer.send("minimize");
    },
    dialog: {
      showErrorBox: (title, content) => {
        console.log(title, content);
        ipcRenderer.send("dialogs-showErrorBox", title, content);
      },
      showMessageBox: (title, content) => {
        console.log(title, content);
        ipcRenderer.send("dialogs-showMessageBox", title, content);
      },
    },
  },
};

contextBridge.exposeInMainWorld("SpinHat", SpinHat);
