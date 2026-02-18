// Default config, user config loading from cosense-dev.config.ts, and defineConfig helper.

import path from 'node:path';

export type Config = {
  scriptsDir: string;
  outDir: string;
  port: number;
  match: string[];
};

const defaultConfig: Config = {
  scriptsDir: 'scripts',
  outDir: 'dist',
  port: 3456,
  match: ['https://scrapbox.io/*'],
};

export function defineConfig(config: Partial<Config>): Partial<Config> {
  return config;
}

export async function loadConfig(): Promise<Config> {
  const configPath = path.resolve(process.cwd(), 'cosense-dev.config.ts');
  const file = Bun.file(configPath);

  if (await file.exists()) {
    const mod = await import(configPath);
    const userConfig: Partial<Config> = mod.default ?? {};
    return { ...defaultConfig, ...userConfig };
  }

  return defaultConfig;
}
