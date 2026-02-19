// Returns the loader logic JS that runs inside the Tampermonkey sandbox.
// Has access to GM_xmlhttpRequest and unsafeWindow from the bootstrap.

export function loaderScript(port: number): string {
  return `
const BASE = "http://localhost:${port}";

// Fetch and eval a single script in the page context via unsafeWindow.eval().
function loadScript(url) {
  GM_xmlhttpRequest({
    method: "GET",
    url: url,
    onload: function (response) {
      if (response.status === 200) {
        unsafeWindow.eval(response.responseText);
        console.log("[cosense-dev] Loaded: " + url);
      } else {
        console.error("[cosense-dev] Failed to load: " + url, response.status);
      }
    },
    onerror: function (error) {
      console.error("[cosense-dev] Error loading: " + url, error);
    },
  });
}

// Fetch the script list from /_scripts and load each one.
function loadAllScripts() {
  GM_xmlhttpRequest({
    method: "GET",
    url: BASE + "/_scripts",
    onload: function (response) {
      if (response.status !== 200) {
        console.error("[cosense-dev] Failed to fetch script list", response.status);
        return;
      }
      const scripts = JSON.parse(response.responseText);
      console.log("[cosense-dev] Loading " + scripts.length + " script(s)...");
      scripts.forEach(function (file) {
        loadScript(BASE + "/" + file);
      });
    },
    onerror: function (error) {
      console.warn("[cosense-dev] Dev server not running?", error);
    },
  });
}

// Poll /_version every second and reload the page when a rebuild is detected.
function watchForChanges() {
  let currentVersion = null;
  setInterval(function () {
    GM_xmlhttpRequest({
      method: "GET",
      url: BASE + "/_version",
      onload: function (response) {
        if (response.status !== 200) return;
        const v = JSON.parse(response.responseText).version;
        if (currentVersion === null) {
          currentVersion = v;
        } else if (v !== currentVersion) {
          console.log("[cosense-dev] Rebuild detected, reloading...");
          location.reload();
        }
      },
    });
  }, 1000);
}

// Poll until Cosense's editor is rendered, then invoke the callback.
function waitForCosenseReady(callback) {
  const check = setInterval(function () {
    if (document.querySelector(".editor")) {
      clearInterval(check);
      callback();
    }
  }, 100);
}

waitForCosenseReady(function () {
  loadAllScripts();
  watchForChanges();
});
`;
}
