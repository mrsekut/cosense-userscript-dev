// Generates loader.user.js — a thin bootstrap that fetches loader logic from the dev server.

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
// @description  Bootstrap for cosense-userscript-dev. Fetches loader logic from the dev server.
${matchEntries}
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      localhost
// @run-at       document-idle
// ==/UserScript==

(function () {
  "use strict";

  // Fetch loader logic from dev server and eval in sandbox (has GM_xmlhttpRequest + unsafeWindow).
  GM_xmlhttpRequest({
    method: "GET",
    url: "http://localhost:${config.port}/_loader",
    onload: function (response) {
      if (response.status === 200) {
        eval(response.responseText);
      } else {
        console.error("[cosense-dev] Failed to load loader", response.status);
      }
    },
    onerror: function () {
      console.warn("[cosense-dev] Dev server not running at http://localhost:${config.port}");
    },
  });
})();
`;

  const loaderPath = path.resolve(process.cwd(), 'loader.user.js');
  await Bun.write(loaderPath, loader);
  console.log('Generated loader.user.js');
}
