import { readFileSync, existsSync } from 'fs';
import { ShangoConfig } from '../types/index.js';
import { parse as parseYAML } from 'yaml';

export async function loadConfigFile() {
  let config: ShangoConfig;

  if (existsSync('shango.yml')) {
    config = parseYAML(readFileSync('shango.yml', 'utf8'));
  } else if (existsSync('shango.json')) {
    config = JSON.parse(readFileSync('shango.json', 'utf8'));
  } else if (existsSync('shango.mjs') || existsSync('shango.js')) {
    const configModule = await import(process.cwd() + '/shango.mjs');
    config = configModule.default;
  } else {
    throw new Error('No configuration file found');
  }
  return config;
}
