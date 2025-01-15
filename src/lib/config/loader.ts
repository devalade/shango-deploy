import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { parse as parseYAML } from 'yaml';
import { ValidatedShangoConfig, validateConfig } from './validator.js';

export class ConfigurationLoader {
  private static instance: ConfigurationLoader;
  private config: ValidatedShangoConfig | null = null;

  private constructor() { }

  static getInstance(): ConfigurationLoader {
    if (!ConfigurationLoader.instance) {
      ConfigurationLoader.instance = new ConfigurationLoader();
    }
    return ConfigurationLoader.instance;
  }

  async load(configPath?: string): Promise<ValidatedShangoConfig> {
    if (this.config) return this.config;

    const paths = [
      configPath,
      join(process.cwd(), 'shango.yml'),
      join(process.cwd(), 'shango.yaml'),
      join(process.cwd(), 'shango.json')
    ].filter(Boolean) as string[];

    for (const path of paths) {
      if (existsSync(path)) {
        const content = readFileSync(path, 'utf8');
        const parsedConfig = path.endsWith('.json')
          ? JSON.parse(content)
          : parseYAML(content);

        try {
          this.config = validateConfig(parsedConfig);
          return this.config;
        } catch (error) {
          throw new Error(`Invalid configuration in ${path}: ${error}`);
        }
      }
    }

    throw new Error('No configuration file found');
  }

  getConfig(): ValidatedShangoConfig {
    if (!this.config) {
      throw new Error('Configuration not loaded');
    }
    return this.config;
  }
}
