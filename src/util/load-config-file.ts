import { ConfigurationLoader } from '../lib/config/loader.js';

export async function loadConfigFile(configPath?: string) {
  const loader = ConfigurationLoader.getInstance();
  return await loader.load(configPath);
}
