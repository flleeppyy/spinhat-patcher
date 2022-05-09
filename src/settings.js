// const { localStorage } = require("electron-browser-storage");

let storage;
// check if we're in a render process
console.log(process.browser)
if (process.type === "renderer") {
  storage = localStorage;
  console.log(storage);
} else {
  storage = require("electron-browser-storage").localStorage;
  console.log(storage);
}
  
// @ts-check
const path = require("path");

async function setSetting(setting, value) {
  const settings = await storage.getItem("settings");
  if (settings) {
    const parsed = JSON.parse(settings);
    parsed[setting] = value;
    await storage.setItem("settings", JSON.stringify(parsed));
  } else {
    await storage.setItem("settings", JSON.stringify({ [setting]: value }));
  }
}

async function getSetting(setting, defaultValue) {
  const settings = await storage.getItem("settings");
  if (settings) {
    const parsed = JSON.parse(settings);
    return parsed[setting] || defaultValue;
  }
}

/**
 * 
 * @returns {Promise<string>}
 */
async function getSpinhatPath() {
  const item = (await getSetting("patchPath"))?.trim();
  if (item && item?.length > 0) {
    console.log(item)
    return item;
  }
  const defaultpath = path.join(process.env.USERPROFILE, "AppData", "Roaming", "spinhat")
  console.log(defaultpath);
  return defaultpath;
}

module.exports = {
  setSetting,
  getSetting,
  getSpinhatPath
}