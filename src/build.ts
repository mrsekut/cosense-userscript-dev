// Builds scripts/*.ts → dist/*.js using Bun.build.

import { Glob } from 'bun';
import path from 'node:path';
import type { Config } from './config.ts';

export async function build(config: Config): Promise<void> {
  const scriptsDir = path.resolve(process.cwd(), config.scriptsDir);
  const outDir = path.resolve(process.cwd(), config.outDir);

  const glob = new Glob('*.ts');
  const entrypoints = (
    await Array.fromAsync(glob.scan({ cwd: scriptsDir }))
  ).map(file => path.join(scriptsDir, file));

  if (entrypoints.length === 0) {
    console.log(`No .ts files found in ${config.scriptsDir}/`);
    return;
  }

  const result = await Bun.build({
    entrypoints,
    outdir: outDir,
    format: 'esm',
    target: 'browser',
  });

  if (!result.success) {
    console.error('Build failed:');
    for (const log of result.logs) {
      console.error(log);
    }
    process.exit(1);
  }

  console.log(`Built ${entrypoints.length} file(s) → ${config.outDir}/`);
}
