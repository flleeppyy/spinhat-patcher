const fs = require("fs");
const path = require("path");

/**
 * Searches for the path of reason-companion-plus-app in the users appdata/local/programs directory
 */
function getReasonCompanionPath() {
  const reasonCompanionPath = path.join(
    process.env.APPDATA,
    "Local",
    "Programs",
    "reason-companion-plus-app"
  );

  if (fs.existsSync(reasonCompanionPath)) {
    return reasonCompanionPath;
  } else {
    return null;
  }
}

/**
 * Check if we're already patched
 */
function isPatched() {
  const reasonCompanionPath = getReasonCompanionPath();
  if (reasonCompanionPath) {
    const reasonCompanionResourcesPath = path.join(
      reasonCompanionPath,
      "resources"
    );
    const files = fs.readdirSync(reasonCompanionResourcesPath);

    return (files.includes("app.asar") && files.includes("app")) ? 1 : 0;
  } else {
    return 1;
  }
}

/**
 * Patch the reason-companion-plus-app
 * - Delete the app folder if there is one in Resources
 * -
 */
async function patch(quick = true) {
  const reasonCompanionPath = getReasonCompanionPath();
  if (reasonCompanionPath) {
    const reasonCompanionResourcesPath = path.join(
      reasonCompanionPath,
      "resources"
    );
    const files = fs.readdirSync(reasonCompanionResourcesPath);

    if (files.includes("app.asar") && files.includes("app")) {
      const appPath = path.join(reasonCompanionResourcesPath, "app.asar");
      const appResourcesPath = path.join(reasonCompanionResourcesPath, "app");




    }
  } else {
    // throw new

  }
}


module.exports = {
  isPatched,
  patch
};