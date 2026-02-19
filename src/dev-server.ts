// Dev server: builds, serves dist/ with CORS, and watches scripts/ for changes.

import { watch } from 'node:fs';
import { Glob } from 'bun';
import path from 'node:path';
import type { Config } from './config.ts';
import { build } from './build.ts';

export async function devServer(config: Config): Promise<void> {
  // Initial build
  await build(config);

  const outDir = path.resolve(process.cwd(), config.outDir);
  const scriptsDir = path.resolve(process.cwd(), config.scriptsDir);

  // Build version — incremented on each rebuild
  let buildVersion = Date.now();

  // Start HTTP server with CORS headers
  const server = Bun.serve({
    port: config.port,
    async fetch(req) {
      const url = new URL(req.url);

      // Return current build version
      if (url.pathname === '/_version') {
        return new Response(JSON.stringify({ version: buildVersion }), {
          headers: {
            ...corsHeaders(),
            'Content-Type': 'application/json; charset=utf-8',
          },
        });
      }

      // Return list of available scripts
      if (url.pathname === '/_scripts') {
        const glob = new Glob('*.js');
        const files = await Array.fromAsync(glob.scan({ cwd: outDir }));
        return new Response(JSON.stringify(files), {
          headers: {
            ...corsHeaders(),
            'Content-Type': 'application/json; charset=utf-8',
          },
        });
      }

      const filePath = path.join(outDir, url.pathname);
      const file = Bun.file(filePath);

      if (!(await file.exists())) {
        return new Response('Not Found', {
          status: 404,
          headers: corsHeaders(),
        });
      }

      return new Response(file, {
        headers: {
          ...corsHeaders(),
          'Content-Type': 'application/javascript; charset=utf-8',
        },
      });
    },
  });

  console.log(`Serving ${config.outDir}/ at http://localhost:${server.port}`);

  // Watch scripts directory for changes
  console.log(`Watching ${config.scriptsDir}/ for changes...`);

  watch(scriptsDir, { recursive: true }, async (_event, filename) => {
    if (filename && filename.endsWith('.ts')) {
      console.log(`\nChanged: ${filename}`);
      await build(config);
      buildVersion = Date.now();
    }
  });
}

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': '*',
  };
}
