import { ShangoConfig } from '../types/index.js';
import { ServerProvisioner } from '../lib/provisionner/index.js';
import { loadConfigFile } from 'src/util/load-config-file.js';

export async function provision(): Promise<void> {
  try {
    let config: ShangoConfig = await loadConfigFile();


    const provisioner = new ServerProvisioner(config);
    await provisioner.provision();

    console.log('✨ Server provisioning completed successfully!');
  } catch (error) {
    console.error('Error during provisioning:', error);
    process.exit(1);
  }
}
