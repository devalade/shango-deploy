import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import { ShangoConfig } from '../types/index.js';





/**
 * Reads and parses the shango.yml file.
 * @returns {Config} The parsed configuration object.
 * @throws Will throw an error if the file cannot be read or parsed.
 */
export function parseShangoConfig(configFile: string): ShangoConfig {
  const configFilePath = path.resolve(process.cwd(), configFile);

  if (!fs.existsSync(configFilePath)) {
    console.error(`Error: ${configFile} file does not exist.`);
    process.exit(1);
  }

  try {
    const fileContents = fs.readFileSync(configFilePath, 'utf8');
    const config = yaml.parse(fileContents) as ShangoConfig;
    return config;
  } catch (error: any) {
    console.error(`Error reading or parsing ${configFile}: ${error.message}`);
    process.exit(1);
  }
}

