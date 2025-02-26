import { KamalConfigurationManager } from '../lib/kamal-config/index.ts';
import { loadConfigFile } from '../util/load-config-file.ts';

export async function update(): Promise<void> {
  try {
    const config = await loadConfigFile();

    const configManager = new KamalConfigurationManager(config);
    await configManager.update();

    console.log(
      '✨ Project configuration has been updated successfully successfully!',
    );
  } catch (error) {
    console.error('Error updating configuration:', error);
    process.exit(1);
  }
}
