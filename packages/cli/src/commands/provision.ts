import { type ShangoConfig } from '../types/index.ts';
import { ServerProvisioner } from '../lib/provisionner/index.ts';
import { loadConfigFile } from '../util/load-config-file.ts';
import { ConfigurationMerger } from '../lib/config/merger.ts';

export async function provision(options: {
  user: string;
  environment: string;
  port: number;
  i: string;
}): Promise<void> {
  try {
    const baseConfig: ShangoConfig = await loadConfigFile();
    const config = options.environment
      ? ConfigurationMerger.mergeWithEnvironment(
          baseConfig,
          options.environment,
        )
      : baseConfig;

    console.log('🚀 Starting server provisioning...');

    const provisioner = new ServerProvisioner(config, {
      username: options.user,
      port: options.port,
      privateKey: options.i,
    });
    await provisioner.provision();
  } catch (error) {
    console.error('❌ Error during provisioning:', error);
    process.exit(1);
  }
}
