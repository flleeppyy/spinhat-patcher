const { contextBridge, shell } = require("electron");
const { existsSync } = require("original-fs");
// const { getSpinhatPath } = require("../../settings");
const defineCommon = require("../common");
const path = require("path");
const { getSetting } = require("../../settings");

const Spinhat = {
  openFolder: (folder) => {
    shell.openPath(folder);
},
  getSpinhatPath: () => {
    const item = getSetting("patchPath");
    if (item && item?.length > 0) {
      return item;
    }
    const defaultpath = path.join(process.env.USERPROFILE, "AppData", "Roaming", "spinhat");
    if (!existsSync(defaultpath)) {
      return null;
    }
    return defaultpath;
  },
  getResourcesPath: () => {
    const resourcePath = path.join(process.env.USERPROFILE, "AppData", "Local", "Programs", "reason-plus-companion-app", "resources");
    if (!existsSync(resourcePath)) {
      return null;
    }
    return resourcePath;
  }
}

defineCommon(Spinhat, "settings");

contextBridge.exposeInMainWorld("Spinhat", Spinhat);
