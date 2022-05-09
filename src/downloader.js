const fs = require("fs");
const path = require("path");
const axios = require("axios");
const tar = require("tar");
const child_process = require("child_process");
const { logger } = require("./logger");
const { getSpinhatPath } = require("./settings");
// Not using isophoric-git because its garbage

const gitUrl = "https://github.com/flleeppyy/spinhat";

/**
 * Download the github repo "flleeppyy/spinhat" and put it into appdata/roaming/spinhat
 * @returns {Promise<string>} "success" - download successful; "failure" - download failed; "already installed" - already installed
 */
async function download() {
  const spinhatPath = await getSpinhatPath();
  // Create the spinhat directory if it dosn't exist
  if (!fs.existsSync(spinhatPath)) {
    await fs.promises.mkdir(spinhatPath, {
      recursive: true,
    });
  }

  // Check if the directory is empty
  if (fs.readdirSync(spinhatPath).length > 0) {
    return "already installed";
  }

  // Download the archive
  const response = await axios.get(gitUrl + "/archive/master.tar.gz", {
    responseType: "arraybuffer",
  });

  const tempPath = path.join(spinhatPath, "temp.tar.gz");
  // Write to temp file
  await fs.promises.writeFile(tempPath, response.data);

  // Extract the archive to the spinhat directory
  //repository is nested inside of repo-master

  await tar.x({
    file: tempPath,
    cwd: spinhatPath,
    strip: 1,
  });

  // Move all the files to the spinhat directory
  // const files = fs.readdirSync(path.join(spinhatDir, "fleepy.tv-master"));
  // for (const file of files) {
  //   await fs.promises.rename(
  //     path.join(spinhatDir, "spinhat-master", file),
  //     path.join(spinhatDir, file)
  //   );
  // }

  // Remove the temp file
  await fs.promises.unlink(tempPath);

  // Initialize repo
  child_process.execSync("git init", {
    cwd: spinhatPath,
  });

  // Add the remote
  const exec = child_process.execSync("git remote add origin " + gitUrl, {
    cwd: spinhatPath,
  });

  if (exec.toString().includes("fatal")) {
    throw new Error("Failed to add remote: \n" + exec.toString());
  }
  return "success";
}

/**
 * Downloads the github repo "flleeppyy/spinhat" and puts it into appdata/roaming/spinhat
 * This is an alternative method that adds the remote and pulls from it, instead of
 * downloading the archive and extracting it.
 * @returns {Promise<string>} "success" - download successful; "failure" - download failed; "already installed" - already installed
 */
async function download2() {
  const spinhatPath = await getSpinhatPath();
  // Create the spinhat directory if it dosn't exist
  if (!fs.existsSync(spinhatPath)) {
    await fs.promises.mkdir(spinhatPath, {
      recursive: true,
    });
  }

  // Check if the directory is empty
  if (fs.readdirSync(spinhatPath).length > 0) {
    return "already installed";
  }

  // Initalize git
  child_process.execSync("git init", {
    cwd: spinhatPath,
  });

  // Add the remote
  const exec = child_process.execSync("git remote add origin " + gitUrl, {
    cwd: spinhatPath,
  });

  // Honestly dont know why im doing this because execSync would just throw an error.
  if (exec.toString().includes("fatal")) {
    throw new Error("Failed to add remote: \n" + exec.toString());
  }

  // Pull from the remote
  const exec2 = child_process.execSync("git pull origin master", {
    cwd: spinhatPath,
  });

  // same here
  if (exec2.toString().includes("fatal")) {
    throw new Error("Failed to pull from remote: \n" + exec2.toString());
  }

  return "success";
}

/**
 * @param {boolean} force - if true, force a fetch. Clears all local changes.
 * @returns {Promise<number>}
 * 1 - fetch successful;
 * 0 - fetch failed;
 * null - not installed
 * -1 - already up to date;
 * -2 - Unstaged changes;
 */
async function update(force = false) {
  const spinhatPath = await getSpinhatPath();
  // if the directory is empty,
  if (fs.readdirSync(spinhatPath).length == 0) {
    return null;
    // await download();
  }

  if (await gitFetch() == null) {
    return null;
  }

  // Compare remote and local commits
  const localCommit = await getLocalCommit();
  const remoteCommit = await getRemoteCommit();

  if (localCommit == null) {
    return null;
  }

  // Check if there are any changes via git command
  let changes = await getChanges();
  if (changes.length > 0) {
    if (force) {
      await gitReset();
    } else {
      return -2;
    }
  } else {
    if (localCommit.hash == remoteCommit.hash) {
      return -1;
    }
  }

  // Pull from git
  const exec = child_process.exec("git pull origin master", {
    cwd: spinhatPath,
  });

  // Wait for the pull to finish
  try {
    await new Promise((resolve, reject) => {
      exec.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          // reject(exec);
        }
      });
      exec.on("error", (e) => {
        reject(e);
      });
    });
  } catch (e) {
    throw new Error("Failed to update spinhat\n" + e);
  }

  return 1;
}

/**
 * @returns {Promise<boolean | null>} true - uninstall successful; false - uninstall failed; null - not installed
 */
async function uninstall() {
  const spinhatPath = await getSpinhatPath();
  try {
    if (fs.existsSync(spinhatPath)) {
      await fs.promises.rm(spinhatPath, {
        recursive: true,
      });
      return true;
    } else {
      return null;
    }
  } catch (e) {
    return false;
  }
}

let gitChangeMapping = {
  "M": "modified",
  "A": "added",
  "D": "deleted",
  "R": "renamed",
  "C": "copied",
  "U": "unmerged",
  "??": "untracked",
};

async function getChanges() {
  const spinhatPath = await getSpinhatPath();

  if (!fs.existsSync(spinhatPath)) {
    return null;
  }
  return child_process
    .execSync("git status --porcelain", {
      cwd: spinhatPath,
    })
    .toString()
    .trim()
    .split("\n")
    .filter((e) => e !== "")
    ?.map((e) => {
      const [, change, file] = e.split(" ");
      return {
        change: gitChangeMapping[change],
        file: file,
      };
    })
    .filter((e) => e.file !== undefined || e.change !== undefined);
}

async function gitReset() {
  const spinhatPath = await getSpinhatPath();

  if (!fs.existsSync(spinhatPath)) {
    return null;
  }
  const exec = child_process.execSync("git reset --hard origin/master", {
    cwd: spinhatPath,
  });

  if (exec.toString().includes("fatal")) {
    throw new Error("Failed to reset spinhat\n" + exec.toString());
  }
}

async function getLocalCommit() {
  const spinhatPath = await getSpinhatPath();
  if (!fs.existsSync(spinhatPath)) {
    return null;
  }
  try {
    // git log HEAD
    const exec = child_process.exec("git log HEAD --max-count 1", {
      cwd: spinhatPath,
    });

    let output = "";
    await new Promise((resolve, reject) => {
      exec.stdout.on("data", (chunk) => {
        output += chunk.toString();
      });

      exec.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          // reject(exec);
        }
      });

      exec.on("error", (e) => {
        reject(e);
      });
    });

    return parseLog(output);
  } catch (e) {
    return null;
  }
}

async function getRemoteCommit() {
  if (await gitFetch() == false) {
    return null;
  }
  const spinhatPath = await getSpinhatPath();
  try {
    // git log origin/master
    const exec = child_process.spawn("git", ["log", "origin/master", "--max-count", "1"], {
      cwd: spinhatPath,
      detached: true,
      env: process.env,
    });

    let output = "";
    await new Promise((resolve, reject) => {
      exec.stdout.on("data", (chunk) => {
        output += chunk.toString();
      });

      exec.on("exit", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(exec);
        }
      });

      exec.on("error", (e) => {
        reject(e);
      });
    });

    return parseLog(output);
  } catch (e) {
    return null;
  }
}

/**
 * @returns {boolean} true - fetch successful; false - fetch failed; null - not installed
 */
async function gitFetch() {
  const spinhatPath = await getSpinhatPath();
  if (!fs.existsSync(spinhatPath)) {
    return false;
  }
  try {
    child_process.execSync("git fetch", {
      cwd: spinhatPath,
    });
    return true;
  } catch (e) {
    // logger.error(e);
    // console.log(e);
    return false;
  }
}

function parseLog(log) {
  try {
    // Parse the log
    const lines = log.split("\n");
    const commitHash = lines[0].split("commit ")[1].slice(0, 7);
    const commitAuthor = lines[1].split("Author: ")[1];
    const commitDate = new Date(lines[2].split("Date:   ")[1]);
    const commitMessage = (lines[3] + " " + lines[4]).trim();
    return {
      hash: commitHash,
      author: commitAuthor,
      message: commitMessage,
      date: commitDate,
    };
  } catch (e) {
    return null;
  }
}

module.exports = {
  download,
  download2,
  update,
  uninstall,
  getLocalCommit,
  getRemoteCommit,
  getChanges,
};
