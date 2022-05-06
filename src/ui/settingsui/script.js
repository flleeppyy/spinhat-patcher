window.onload = async function() {
  const $ = document.querySelector.bind(document);

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

  $("patch-path").addEventListener("change", () => {
    const value = $("patch-path").value.trim();
    if (value) {
      localStorage.setItem("patchPath", value);
    }
  });
}