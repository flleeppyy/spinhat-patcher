$("#window-controls > #minimize").addEventListener("click", () => {
  console.log("minimized");
  electron.ipcRenderer.send("minimize")
});

$("#window-controls > #close").addEventListener("click", () => {
  console.log("closing");
  electron.ipcRenderer.send("close")
});

// When document is ready
$(document).ready(() => {
  const patchStatus = electron.ipcRenderer.sendSync("getPatchStatus");
  // 0 = not patched, 1 = patched, 2 = patching

  // Set patch-button text based on patch status
  if (patchStatus == 0) {
    $("#patch-button").innerText = "Patch";
  } else if (patchStatus == 1) {
    $("#patch-button").innerText = "Unpatch";
  } else if (patchStatus == 2) {
    $("#patch-button").innerText = "Patching...";
  }

  switch (patchStatus) {
    case 0:
      $("#patch-status").innerText = "Not patched";
      break;
    case 1:
      $("#patch-status").innerText = "Patched";
      break;
    case 2:
      $("#patch-status").innerText = "Patching...";
      break;
    default:
      $("#patch-status").innerText = "Unknown";
      break;
  }

  // Set patch-button to be disabled if patching
  if (patchStatus == 2) {
    $("#patch-button").disabled = true;
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
