import { ShangoConfig } from '../types/index.js';
import { ServerProvisioner } from '../lib/provisionner/index.js';
import { loadConfigFile } from '../util/load-config-file.js';
import { ConfigurationMerger } from '../lib/config/merger.js';

export async function provision(environment?: string): Promise<void> {
  try {
    const baseConfig: ShangoConfig = await loadConfigFile();

    const config = environment
      ? ConfigurationMerger.mergeWithEnvironment(baseConfig, environment)
      : baseConfig;

    console.log('🚀 Starting server provisioning...');

    const provisioner = new ServerProvisioner(config);
    await provisioner.provision();

    console.log('✨ Server provisioning completed successfully!');
  } catch (error) {
    console.error('❌ Error during provisioning:', error);
    process.exit(1);
  }
}
