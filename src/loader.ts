// Generates loader.user.js for Tampermonkey that loads local scripts via GM_xmlhttpRequest.

import path from 'node:path';
import type { Config } from './config.ts';

export async function generateLoader(config: Config): Promise<void> {
  const matchEntries = config.match
    .map(m => `// @match        ${m}`)
    .join('\n');

  const loader = `// ==UserScript==
// @name         cosense-userscript-dev loader
// @namespace    cosense-userscript-dev
// @version      1.0
// @description  Load local dev scripts into Cosense/Scrapbox via Tampermonkey
${matchEntries}
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      localhost
// @run-at       document-idle
// ==/UserScript==

(function () {
  "use strict";

  const BASE = "http://localhost:${config.port}";

  waitForCosenseReady(function () {
    loadAllScripts();
    watchForChanges();
  });

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

  // Poll until Cosense's editor is rendered, then invoke the callback.
  function waitForCosenseReady(callback) {
    const check = setInterval(function () {
      if (document.querySelector(".editor")) {
        clearInterval(check);
        callback();
      }
    }, 100);
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
})();
`;

  const loaderPath = path.resolve(process.cwd(), 'loader.user.js');
  await Bun.write(loaderPath, loader);
  console.log('Generated loader.user.js');
}
