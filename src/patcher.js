//@ts-check
const fs = require("fs");
const path = require("path");
const crypto = require("node:crypto");

const spinhatPath = path.join(process.env.USERPROFILE, "AppData", "Roaming", "spinhat");

const bakedHashes = {
  app: {
    "package.json": "611930235e26c2afef04728555baa9bbedecb497",
  },
};

/**
 * Some resources may be different per user/system, but we can generate a hash of some of them, sha1
 * @param {string} fileName Filename relative to the apps resources directory
 * @returns {string | null} The sha1 hash of the file
 */
function getBakedHashOfResource(fileName) {
  const rppath = getReasonCompanionPath();
  if (rppath) {
    const resourcePath = path.join(rppath, "resources");
    // const filePath = path.join(resourcePath, fileName);
    switch (fileName) {
      case "package.json":
        return bakedHashes.app["package.json"];
      case "index.js":
        // generate hash of the link to spinhat/libs/injector.js
        const injectorPath = path.join(spinhatPath, "spinhat", "main.js");
        const injectorHash = crypto.createHash("sha1").update(fs.readFileSync(injectorPath)).digest("hex");
        return injectorHash;
      default:
        return null;
    }
  }
  return null;
}

/**
 * Searches for the path of reason-companion-plus-app in the users appdata/local/programs directory
 */
function getReasonCompanionPath() {
  const reasonCompanionPath = path.join(process.env.USERPROFILE, "Appdata", "Local", "Programs", "reason-plus-companion-app");

  if (fs.existsSync(reasonCompanionPath)) {
    return reasonCompanionPath;
  } else {
    return null;
  }
}

function getsha1hash(string) {
  return crypto.createHash("sha1").update(string).digest("hex");
}
/**
 * Check if we're patched and verifys the hashes of the files
 * @param {boolean} lazy
 * @returns {Promise<number>}
  0 - not patched;
  1 - patched;
  -1 - Patched with bad integrity
 */
async function isPatched(lazy = false) {
  if (!lazy) {
    const rppath = getReasonCompanionPath();
    if (!rppath || !fs.existsSync(rppath)) {
      throw new ReasonPlusCompanionNotInstalledError("Reason+ Companion is not installed. Checked: " + rppath);
    }

    const appFolder = path.join(rppath, "resources", "app");

    if (!fs.existsSync(appFolder)) {
      return 0;
    }

    const files = await fs.promises.readdir(appFolder);
    for (const file of files) {
      let bakedHash;
      try {
        bakedHash = getBakedHashOfResource(file);
      } catch (e) {
        continue;
      }
      if (!bakedHash) {
        continue;
      }
      const filePath = path.join(appFolder, file);

      switch (file) {
        case "index.js":
          {
            try {
              const injectorPath = path.join(spinhatPath, "spinhat", "main.js");
              const indexString = `require("${injectorPath.replace(/\\/g, "\\\\")}");`;
              const indexHash = getsha1hash(indexString);
              const fileHash = getsha1hash(fs.readFileSync(filePath));

              if (indexHash !== fileHash) {
                return -1;
              }
            } catch (e) {
              return -1;
            }
          }
          break;
        default:
          const fileHash = getsha1hash(fs.readFileSync(filePath));
          if (fileHash !== bakedHash) {
            return -1;
          }
          break;
      }
    }
    return 1;
  } else {
    const reasonCompanionPath = getReasonCompanionPath();
    if (reasonCompanionPath) {
      const reasonCompanionResourcesPath = path.join(reasonCompanionPath, "resources");
      const files = await fs.promises.readdir(reasonCompanionResourcesPath);

      if (files.includes("app.asar") && files.includes("app")) {
        fs;
      }
    } else {
      return 0;
    }
  }
}

async function patch() {
  const rppath = getReasonCompanionPath();

  if (!fs.existsSync(spinhatPath)) {
    throw new SpinhatNotInstalledError("SpinHat is not installed. Checked: " + spinhatPath);
  }

  if (!rppath || !fs.existsSync(rppath)) {
    throw new ReasonPlusCompanionNotInstalledError("Reason+ Companion is not installed. Checked: " + rppath);
  }

  try {
    const resourcePath = path.join(rppath, "resources");
    return await require(path.join(spinhatPath, "spinhat/utils", "patcher")).patch(resourcePath, spinhatPath);
  } catch (e) {
    throw new SpinhatPatchFailedError(e);
  }
}

async function unpatch() {
  const rppath = getReasonCompanionPath();

  if (!rppath || !fs.existsSync(rppath)) {
    throw new ReasonPlusCompanionNotInstalledError("Reason+ Companion is not installed. Checked: " + rppath);
  }

  try {
    const resourcePath = path.join(rppath, "resources");
    return await require(path.join(spinhatPath, "spinhat/utils", "patcher")).unpatch(resourcePath);
  } catch (e) {
    throw new SpinhatUnpatchFailedError(e);
  }
}

// create a new error called "SpinhatNotInstalledError"
class SpinhatNotInstalledError extends Error {
  constructor(message) {
    super(message);
    this.name = "SpinhatNotInstalledError";
  }
}

class SpinhatPatchFailedError extends Error {
  constructor(message) {
    super(message);
    this.name = "SpinhatPatchFailedError";
  }
}

class SpinhatUnpatchFailedError extends Error {
  constructor(message) {
    super(message);
    this.name = "SpinhatUnpatchFailedError";
  }
}

class ReasonPlusCompanionNotInstalledError extends Error {
  constructor(message) {
    super(message);
    this.name = "ReasonPlusCompanionNotInstalledError";
  }
}

module.exports = {
  isPatched,
  patch,
  unpatch,
  getReasonCompanionPath,
  SpinhatNotInstalledError,
  SpinhatPatchFailedError,
};
