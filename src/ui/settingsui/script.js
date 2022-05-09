window.onload = async function() {
  const $ = document.querySelector.bind(document);

  // Window Controls
  $("#window-controls > #minimize").addEventListener("click", () => {
    console.log("minimized");
    Spinhat.window.minimize();
  });

  $("#window-controls > #close").addEventListener("click", () => {
    console.log("closing");
    Spinhat.window.close();
  });

  $("#save-settings").addEventListener("click", () => {
    console.log("saving settings");
    // for each input in the settings
    const inputs = document.querySelectorAll("#settings > .setting-container input");
    for (const input of inputs) {
      // hee-hoo-haa -> heeHooHaa
      const setting = cssFormat(input.id);
      // TODO: Add code for checkbox
      // set the setting to the value of the input
      console.log(input.value)
      setSetting(setting, input.value);
    }
    Spinhat.window.close();
  });

  $("#cancel").addEventListener("click", () => {
    console.log("canceling");
    loadSettings();
    Spinhat.window.close();
  });

  // Load settings
  function loadSettings() {
    const settingsInputs = settings.querySelectorAll("#settings > .setting-container input");
    for (const input of settingsInputs) {
      console.log(input, input.type,input.value)
      const setting = cssFormat(input.id);
      // get inputLabel above input
      const inputLabel = input.parentNode.querySelector("label");
      // const inputLabel = settings.querySelector(`#settings > .setting-container label[for="${input.id}"]`);
      // input.value = getSetting(setting, input.value);
      if (input.type === "checkbox") {
        input.checked = getSetting(setting, input.checked);
      } else {
        input.value = getSetting(setting, input.value);
        if (inputLabel) inputLabel.innerHTML = input.value;
        console.log(input.value)
      }
    }  
  }
  loadSettings();

  // Tools
  $("#open-resources-folder").addEventListener("click", async () => {
    const path = getSetting("patchPath");
    if (!path) {
      alert("Could not find resources folder");
      return;
    }
    Spinhat.openFolder(Spinhat.getResourcesPath());
  });

  $("#open-spinhat-folder").addEventListener("click", async () => {
    const path = Spinhat.getSpinhatPath();
    if (!path) {
      alert("Could not find spinhat folder");
      return;
    }
    Spinhat.openFolder(Spinhat.getSpinhatPath());
  })
};


function setSetting(setting, value) {
  const settings = localStorage.getItem("settings");
  if (settings) {
    const parsed = JSON.parse(settings);
    parsed[setting] = value;
    localStorage.setItem("settings", JSON.stringify(parsed));
  } else {
    localStorage.setItem("settings", JSON.stringify({ [setting]: value }));
  }
}

function getSetting(setting, defaultValue) {
  const settings = localStorage.getItem("settings");
  if (settings) {
    const parsed = JSON.parse(settings);
    return parsed[setting] || defaultValue;
  }
}

function cssFormat(input) {
  return input.replace(/-([a-z])/g, (match, p1) => p1.toUpperCase());
}