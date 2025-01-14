import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { ShangoConfig } from '../types/index.js';
import { ServerProvisioner } from '../lib/provisionner/idnex.js';
import { parse as parseYAML } from 'yaml';

export async function provision(): Promise<void> {
  try {
    // Try to read configuration file in different formats
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

    const provisioner = new ServerProvisioner(config);
    await provisioner.provision();

    console.log('✨ Server provisioning completed successfully!');
  } catch (error) {
    console.error('Error during provisioning:', error);
    process.exit(1);
  }
}
