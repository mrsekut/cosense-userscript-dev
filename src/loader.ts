// Generates loader.user.js for Tampermonkey that loads local scripts via GM_xmlhttpRequest.

import { Glob } from 'bun';
import path from 'node:path';
import type { Config } from './config.ts';

export async function generateLoader(config: Config): Promise<void> {
  const outDir = path.resolve(process.cwd(), config.outDir);
  const glob = new Glob('*.js');
  const files = await Array.fromAsync(glob.scan({ cwd: outDir }));

  if (files.length === 0) {
    console.error(
      `No .js files found in ${config.outDir}/. Run "cosense-userscript-dev build" first.`,
    );
    process.exit(1);
  }

  const matchEntries = config.match
    .map(m => `// @match        ${m}`)
    .join('\n');

  const scriptLoads = files
    .map(file => `    loadScript("http://localhost:${config.port}/${file}");`)
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

  function loadScript(url) {
    GM_xmlhttpRequest({
      method: "GET",
      url: url,
      onload: function (response) {
        if (response.status === 200) {
          console.log("[cosense-dev] Fetched: " + url + " (" + response.responseText.length + " bytes)");
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

  function waitForCosenseReady(callback) {
    var check = setInterval(function () {
      if (document.querySelector(".page-menu")) {
        clearInterval(check);
        console.log("[cosense-dev] Cosense ready, loading scripts...");
        callback();
      }
    }, 100);
  }

  waitForCosenseReady(function () {
${scriptLoads}
  });
})();
`;

  const loaderPath = path.resolve(process.cwd(), 'loader.user.js');
  await Bun.write(loaderPath, loader);
  console.log(`Generated loader.user.js (${files.length} script(s))`);
}
