// on document ready
document.addEventListener("DOMContentLoaded", () => {
  const $ = document.querySelector.bind(document);
  $("#window-controls > #minimize").addEventListener("click", () => {
    console.log("minimized");
    electron.ipcRenderer.send("minimize")
  });

  $("#window-controls > #close").addEventListener("click", () => {
    console.log("closing");
    electron.ipcRenderer.send("close")
  });

  electron.ipcRenderer.invoke("getPatchStatus").then(patchStatus => {
    setPatchStatus(patchStatus);
  });

  electron.ipcRenderer.on("patching", () => {
    setPatchStatus(2);
  });

  electron.ipcRenderer.on("patched", () => {
    setPatchStatus(1);
  });

  // -1 = checking, 0 = not patched, 1 = patched, 2 = patching
  function setPatchStatus(patchStatus) {
    switch (patchStatus) {
      case -1:
        $("#patch-status").innerHTML = "Checking...";
        $("#patch-status").classList.add("checking");
        $("#patch-status").classList.remove("patched");
        $("#patch-status").classList.remove("patching");
        $("#patch-button").disabled = true;
        break;
      case 0:
        $("#patch-button").innerText = "Patch";
        $("#patch-status").innerText = "Not patched";
        break;
      case 1:
        $("#patch-status").innerText = "Patched";
        $("#patch-button").innerText = "Unpatch";
        break;
      case 2:
        $("#patch-status").innerText = "Patching...";
        $("#patch-button").innerText = "Patching...";
        break;
      default:
        $("#patch-status").innerText = "Unknown";
        break;
      }

      // Set patch-button to be disabled if patching
      if (patchStatus == 2) {
        $("#patch-button").disabled = true;
      } else {
        $("#patch-button").disabled = false;
      }
  }



  $("#patch-button").addEventListener("click", () => {

    // If patching, don't do anything
    if (patchStatus == 2) {
      return;
    }

    // If not patched, patch
    if (patchStatus == 0) {
      electron.ipcRenderer.send("patch")
    }
    // If patched, unpatch
    else if (patchStatus == 1) {
      electron.ipcRenderer.send("unpatch")
    }

  });

});