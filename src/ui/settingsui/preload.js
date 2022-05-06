const { contextBridge } = require("electron");
const defineCommon = require("../common");

const Spinhat = {

}

defineCommon(Spinhat, "settings");

contextBridge.exposeInMainWorld("Spinhat", Spinhat);
