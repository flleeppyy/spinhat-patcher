//@ts-check
/// <reference path="../typings/ui.d.ts" />

// what if
// i could set typings for all the contexts and functions
// WITHOUT USING JSDOC FOR FUCKING EVERYTHING?!

window.onload = async () => {

  /**
   * @type {Document["querySelector"]}
   */
  const $ = document.querySelector.bind(document);

  /**
   * @type {HTMLDivElement}
   */
  const $commitStatus = $("#spinhat-commit-status");
  /**
   * @type {HTMLSelectElement}
   */
  const $downloadSelect = $("#download-select");
  /**
   * @type {HTMLButtonElement}
   */
  const $downloadButton = $("#download-button");
  /**
   * @type {HTMLDivElement}
   */
  const $commitInfoHover = $("#spinhat-commitinfo-hover");
  /**
   * @type {HTMLButtonElement}
   */
  const $patchButton = $("#patch-button");
  /**
   * @type {HTMLSelectElement}
   */
  const $patchSelect = $("#patch-select");
  /**
   * @type {HTMLSpanElement}
   */
  const $patchStatus = $("#patch-status");
  /**
   * @type {HTMLDivElement}
   */
  const $commitInfoHoverContent = $("#spinhat-commitinfo-hover-content");

  /// refer to
  async function checkCommits() {
    // Fetch commit values
    const localCommit = await SpinHat.git.getLocalCommit();
    const remoteCommit = await SpinHat.git.getRemoteCommit();
    const changes = await SpinHat.git.getChanges();
    if (localCommit) {
      if (localCommit.hash === remoteCommit.hash) {
        $commitStatus.innerText = "Up to date";
        setCommitStatusClass("success");
      } else {
        $commitStatus.innerText = "Outdated";
        setCommitStatusClass("error");
      }

      if (changes?.length > 0) {
        $commitStatus.innerText = "Up to date w/Unstaged changes";
        setCommitStatusClass("warning");
      }

      // set commit values
      $commitInfoHoverContent.innerText = `${localCommit.hash} from ${localCommit.author}:\n${localCommit.message}`;
      $downloadSelect.selectedIndex = 1;
    } else {
      $commitInfoHover.style.display = "none";
      $commitStatus.innerText = "Not Installed";
      setCommitStatusClass("error");
    }

    // Compare commit values
  }

  async function checkPatched() {
    try {
      const patched = await SpinHat.patcher.isPatched();

      switch (patched) {
        case 1:
          $patchStatus.innerText = "Patched";
          setPatchStatusClass("success");
          break;
        case 0:
          $patchStatus.innerText = "Not Patched";
          setPatchStatusClass("warning");
          break;
        case -1:
          $patchStatus.innerText = "Patched with bad integrity";
          setPatchStatusClass("error");
          break;
        default:
          $patchStatus.innerText = "Unknown";
          setPatchStatusClass("error");
          break;
      }
    } catch (e) {
      $patchStatus.innerText = "Unknown";
      setPatchStatusClass("error");
      SpinHat.window.dialog.showErrorBox("Error", "Failed to check patch status: " + e);
    }
  }

  checkCommits();
  checkPatched();

  // Window Controls
  $("#window-controls > #minimize").addEventListener("click", () => {
    console.log("minimized");
    SpinHat.window.minimize();
  });

  $("#window-controls > #close").addEventListener("click", () => {
    console.log("closing");
    SpinHat.window.close();
  });

  $("#window-controls > #settings").addEventListener("click", () => {
    console.log("showing settings");
    SpinHat.window.showSettings();
  });

  // Commit info

  $commitInfoHover.addEventListener("mouseover", () => {
    $commitInfoHoverContent.style.display = "block";
  });

  $commitInfoHover.addEventListener("mouseout", () => {
    $commitInfoHoverContent.style.display = "none";
  });

  $downloadButton.addEventListener("click", (event) => {
    download(event);
  });

  $patchButton.addEventListener("click", async () => {
    // Get value of patch-select
    const selectedPatch = $patchSelect.options[$patchSelect.selectedIndex].innerHTML;

    // if Patch
    switch (selectedPatch) {
      case "Patch":
        console.log("patching");
        try {
          const result = await SpinHat.patcher.patch();
          if (result) {
            SpinHat.window.dialog.showMessageBox("Success", "SpinHat has been successfully patched into Reason+ Companion");
            $patchStatus.innerText = "Patched";
            setPatchStatusClass("success");
          } else {
            SpinHat.window.dialog.showMessageBox(
              "Patching Failed",
              "SpinHat could not be patched into Reason+ Companion. result: " + result,
            );
            $patchStatus.innerText = "Errored";
            setPatchStatusClass("error");
          }
        } catch (e) {
          // If the message contains EBUSy
          if (e.message.includes("EBUSY")) {
            SpinHat.window.dialog.showMessageBox(
              "Patching failed",
              "A file is currently in use and cannot be patched. \nPlease close software that could potentionally be holding these files hostage.\n" +
                e,
            );
          } else {
            SpinHat.window.dialog.showMessageBox("Patching Failed", e.toString());
          }
          $patchStatus.innerText = "Errored";
        }
        break;
      case "Unpatch":
        console.log("unpatching");
        try {
          const result = await SpinHat.patcher.unpatch();
          console.log(result);
          if (result) {
            SpinHat.window.dialog.showMessageBox("Unpatching successful", "Success");
            $patchStatus.innerText = "Not Patched";
            setPatchStatusClass("warning");
          } else {
            SpinHat.window.dialog.showMessageBox("Unpatching Failed", "Reason+ Companion is not patched");
            $patchStatus.innerText = "Not Patched";
            setPatchStatusClass("warning");
          }
        } catch (e) {
          console.error(e);
          if (e.name === "ReasonPlusCompanionNotInstalledError") {
            SpinHat.window.dialog.showMessageBox("Unpatching Failed", "Reason+ Companion is not installed");
            $patchStatus.innerText = "Not Patched";
            setPatchStatusClass("error");
          }
        }
        break;
      default:
        console.log("no patch selected");
        break;
    }
  });

  // error, warning, and success are our classes
  /**
   * @param {"warning" | "error" | "success"} cls - the class to set
   * @returns {void}
   */
  function setCommitStatusClass(cls) {
    switch (cls) {
      case "error":
        $commitStatus.classList.add("error");
        $commitStatus.classList.remove("success");
        $commitStatus.classList.remove("warning");
        break;
      case "warning":
        $commitStatus.classList.add("warning");
        $commitStatus.classList.remove("success");
        $commitStatus.classList.remove("error");
        break;
      default:
      case "success":
        $commitStatus.classList.add("success");
        $commitStatus.classList.remove("error");
        $commitStatus.classList.remove("warning");
        break;
    }
  }

  /**
   * @param {"warning" | "error" | "success"} cls - the class to set
   * @returns {void}
   */
  function setPatchStatusClass(cls) {
    switch (cls) {
      case "error":
        $patchStatus.classList.add("error");
        $patchStatus.classList.remove("success");
        $patchStatus.classList.remove("warning");
        break;
      case "warning":
        $patchStatus.classList.add("warning");
        $patchStatus.classList.remove("success");
        $patchStatus.classList.remove("error");
        break;
      default:
      case "success":
        $patchStatus.classList.add("success");
        $patchStatus.classList.remove("error");
        $patchStatus.classList.remove("warning");
        break;
    }
  }

  async function download(event) {
    const selection = $downloadSelect;
    if (selection.value === "Install") {
      console.log("installing");
      let result;

      try {
        result = await SpinHat.downloader.download();
        switch (result) {
          case "success":
            $commitStatus.innerText = "Installed";
            setCommitStatusClass("success");
            SpinHat.window.dialog.showMessageBox("Success", "SpinHat has been installed successfully.");
            checkCommits();
            break;
          case "already installed":
            SpinHat.window.dialog.showMessageBox("Already installed", "SpinHat is already installed. You probaby meant to update");
            break;
          default:
            SpinHat.window.dialog.showErrorBox("Error", "Nothing was returned from the downloader, this might be an issue.");
        }
      } catch (error) {
        SpinHat.window.dialog.showErrorBox("Error", error.message);
      }
    } else if (selection.value === "Update") {
      console.log("updating");
      // If the user is holding down the shift key, we'll force an update
      const forceUpdate = event.shiftKey;
      let result;
      try {
        result = await SpinHat.downloader.update(forceUpdate);
      } catch (error) {
        SpinHat.window.dialog.showErrorBox("Error", error.message);
      }
      console.log(result);
      switch (result) {
        // Update successful
        case 1:
          $commitStatus.innerText = "Up to date";
          setCommitStatusClass("success");
          SpinHat.window.dialog.showMessageBox("Success", "SpinHat has been updated successfully.");
          checkCommits();
          break;
        // Update failed
        case 0:
          SpinHat.window.dialog.showErrorBox("Error", "There was an error updating SpinHat.");
          break;
        // Not installed
        case null:
          $commitStatus.innerText = "Not installed";
          setCommitStatusClass("error");
          SpinHat.window.dialog.showMessageBox("Not installed", "SpinHat is not installed. You probaby meant to install");
          break;
        // Already up to date
        case -1:
          $commitStatus.innerText = "Up to date";
          setCommitStatusClass("success");
          SpinHat.window.dialog.showMessageBox("Info", "SpinHat is up to date.");
          break;
        // Unstaged changes
        case -2:
          SpinHat.window.dialog.showMessageBox(
            "Warning",
            "There are unstaged changes in your repository. Please commit or stash them before updating.\n\nIf you don't care about your changes, you can force the update by holding down the shift key.",
          );
          break;
          checkCommits();
      }
    } else if (selection.value === "Uninstall") {
      // Check if there are unstaged changes
      const gitchanges = await SpinHat.git.getChanges();
      if (gitchanges.length > 0) {
        SpinHat.window.dialog.showErrorBox(
          "Error",
          "There are unstaged changes in your repository. Please push them before uninstalling.",
        );
      }

      console.log("uninstalling");
      const result = await SpinHat.downloader.uninstall();
      if (result) {
        $commitStatus.innerText = "Not installed";
        setCommitStatusClass("error");
        SpinHat.window.dialog.showMessageBox("Success", "SpinHat has been uninstalled successfully.");
        checkCommits();
      } else if (result === false) {
        SpinHat.window.dialog.showErrorBox(
          "Error",
          "An error occured during uninstallation. Things to check for:\n\n- SpinHat's folder is not open in explorer\n- SpinHat's folder is not in use by another program\n- Read and write permissions are set correctly",
        );
      } else if (result === null) {
        SpinHat.window.dialog.showMessageBox("Not installed", "SpinHat is not installed.");
      }
    }
  }
};
