const { localStorage } = require("electron-browser-storage");

async function setSetting(setting, value) {
  const settings = await localStorage.getItem("settings");
  if (settings) {
    const parsed = JSON.parse(settings);
    parsed[setting] = value;
    await localStorage.setItem("settings", JSON.stringify(parsed));
  } else {
    await localStorage.setItem("settings", JSON.stringify({ [setting]: value }));
  }
}

async function getSetting(setting, defaultValue) {
  const settings = await localStorage.getItem("settings");
  if (settings) {
    const parsed = JSON.parse(settings);
    return parsed[setting] || defaultValue;
  }
}

module.exports = {
  setSetting,
  getSetting,
}