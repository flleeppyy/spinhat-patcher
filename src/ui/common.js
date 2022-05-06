const { ipcRenderer,  } = require("electron");

module.exports = function defineCommonSpinhat(spinhat, basename) {
  const base = {
    window: {
      close: () => {
        ipcRenderer.send(basename + "Close");
      },
      minimize: () => {
        ipcRenderer.send(basename + "Minimize");
      },
      hide: () => {
        ipcRenderer.send(basename + "Hide");
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
        /**
         *
         * @param {import("electron/main").OpenDialogOptions} options
         * @returns
         */
        showOpenDialog: (options) => {
          return ipcRenderer.invoke("dialogs-showOpenDialog", options);
        }
      },
    },
  };

  Object.assign(spinhat, base);
}