const { contextBridge, ipcRenderer } = require("electron");

const running = {
  patcher: {},
  downloader: {},
  git: {},
};
const SpinHat = {
  patcher: {
    patch: async () => {
      // return await ipcRenderer.invoke("patch");
      if (!running.patcher.patch) {
        running.patcher.patch = true;
        return await ipcRenderer.invoke("patch").finally(() => (running.patcher.patch = false));
      }
      return -1931;
    },
    unpatch: async () => {
      // return await ipcRenderer.invoke("unpatch");
      if (!running.patcher.unpatch) {
        running.patcher.unpatch = true;
        return await ipcRenderer.invoke("unpatch").finally(() => (running.patcher.unpatch = false));
      }
      return -1931;
    },
    isPatched: async () => {
      // return await ipcRenderer.invoke("isPatched");
      if (!running.patcher.isPatched) {
        running.patcher.isPatched = true;
        return await ipcRenderer.invoke("isPatched").finally(() => (running.patcher.isPatched = false));
      }
    },
  },
  downloader: {
    download: async (...args) => {
      // return await ipcRenderer.invoke("download", ...args);
      if (!running.downloader.download) {
        running.downloader.download = true;
        return await ipcRenderer.invoke("download", ...args).finally(() => (running.downloader.download = false));
      }
      return -1931;
    },
    update: async (...args) => {
      // return await ipcRenderer.invoke("update", ...args);
      if (!running.downloader.update) {
        running.downloader.update = true;
        return await ipcRenderer.invoke("update", ...args).finally(() => (running.downloader.update = false));
      }
      return -1931;
    },
    uninstall: async (...args) => {
      // return await ipcRenderer.invoke("uninstall", ...args);
      if (!running.downloader.uninstall) {
        running.downloader.uninstall = true;
        return await ipcRenderer.invoke("uninstall", ...args).finally(() => (running.downloader.uninstall = false));
      }
      return -1931;
    },
  },
  git: {
    getLocalCommit: async () => {
      // return await ipcRenderer.invoke("getLocalCommit");
      if (!running.git.getLocalCommit) {
        running.git.getLocalCommit = true;
        return await ipcRenderer.invoke("getLocalCommit").finally(() => (running.git.getLocalCommit = false));
      }
      return -1931;
    },
    getRemoteCommit: async () => {
      // return await ipcRenderer.invoke("getRemoteCommit");
      if (!running.git.getRemoteCommit) {
        running.git.getRemoteCommit = true;
        return await ipcRenderer.invoke("getRemoteCommit").finally(() => (running.git.getRemoteCommit = false));
      }
      return -1931;
    },
    getChanges: async () => {
      // return await ipcRenderer.invoke("getChanges");
      if (!running.git.getChanges) {
        running.git.getChanges = true;
        return await ipcRenderer.invoke("getChanges").finally(() => (running.git.getChanges = false));
      }
      return -1931;
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
