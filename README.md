# cosense-userscript-dev

A local development tool for Cosense (Scrapbox) UserScripts.

Write Cosense UserScripts in TypeScript, build and serve them locally, and see changes auto-reloaded in the browser.

## Features

- **TypeScript** — Write Cosense UserScripts in TypeScript
- **Hot reload** — Edit in your editor, save, and changes are reflected in the browser automatically
- **Zero config** — Just put `.ts` files in `scripts/` and run `bunx cosense-userscript-dev`

## Demo

[![Demo](https://i.gyazo.com/3ff734c0a2a477c9b933dd29066de3fd.gif)](https://gyazo.com/3ff734c0a2a477c9b933dd29066de3fd)

## Installation

No install required — use `bunx` to run directly:

```bash
bunx cosense-userscript-dev
```

Optionally, add it as a dev dependency for `defineConfig` type support in `cosense-dev.config.ts`:

```bash
bun add -d cosense-userscript-dev
```

## Quick Start

See [TUTORIAL-ja.md](./TUTORIAL-ja.md) for a detailed step-by-step walkthrough. For a working example, see [mrsekut/userscripts](https://github.com/mrsekut/userscripts).

1. Generate the Tampermonkey bootstrap (one-time):

```bash
bunx cosense-userscript-dev loader
```

2. Create a `scripts/` directory and write Cosense UserScripts in TypeScript:

```
my-userscripts/
  scripts/
    foo.ts    ← uses cosense.PageMenu.addMenu(), etc.
    bar.ts
  package.json
```

3. Start the dev server:

```bash
bunx cosense-userscript-dev
```

4. Copy the contents of `loader.user.js` into Tampermonkey. This is a one-time setup — the bootstrap is stable and does not need to be updated when you add scripts or update the library.

## Commands

### `cosense-userscript-dev` (default: dev)

- Builds `scripts/*.ts` → `dist/*.js`
- Serves `dist/` via HTTP with CORS headers
- Watches `scripts/` for changes, auto-rebuilds, and triggers browser reload

### `cosense-userscript-dev build`

- One-shot build of `scripts/*.ts` → `dist/*.js`

### `cosense-userscript-dev loader`

- Generates `loader.user.js` — a thin Tampermonkey bootstrap
- Only needs to be run once (or when `port` / `match` config changes)

## Configuration

No configuration is needed if you follow the default conventions. To customize, create a `cosense-dev.config.ts` file:

```ts
import { defineConfig } from 'cosense-userscript-dev';

// default values are used if not specified
export default defineConfig({
  scriptsDir: 'scripts',
  outDir: 'dist',
  port: 3456,
  match: ['https://scrapbox.io/*'],
});
```

## Project Structure (user side)

```
my-userscripts/
  scripts/          … Cosense UserScripts (TypeScript)
    foo.ts
    bar.ts
  dist/             … build output (add to .gitignore)
  loader.user.js    … Tampermonkey bootstrap (generated once by `loader` command)
  cosense-dev.config.ts  … optional config
  package.json
```

## License

MIT
