#!/usr/bin/env bun
// CLI entry point. Routes subcommands.

import { loadConfig } from './config.ts';
import { build } from './build.ts';
import { devServer } from './dev-server.ts';
import { generateLoader } from './loader.ts';

const command = process.argv[2];

const config = await loadConfig();

switch (command) {
  case 'build':
    await build(config);
    break;
  case 'loader':
    await generateLoader(config);
    break;
  case 'dev':
  case undefined:
    await devServer(config);
    break;
  default:
    console.error(`Unknown command: ${command}`);
    console.error('Usage: cosense-userscript-dev [dev|build|loader]');
    process.exit(1);
}
