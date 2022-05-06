const { contextBridge } = require("electron");
const defineCommon = require("../common");

// const SpinHat = {
  
// }

defineCommon(SpinHat, "settings");

contextBridge.exposeInMainWorld("SpinHat", SpinHat);
