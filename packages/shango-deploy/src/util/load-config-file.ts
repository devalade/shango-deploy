import { ConfigurationLoader } from '../lib/config/loader.ts';

export async function loadConfigFile(configPath?: string) {
  const loader = ConfigurationLoader.getInstance();
  return await loader.load(configPath);
}
