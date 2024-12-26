import { AccessoriesConfigOptions, AccessoryConfig } from "../../types/kamal-generator.js";
import { ConfigurationSection } from "./configuration-section.js";

// Accessories Configuration
export class AccessoriesConfiguration extends ConfigurationSection<AccessoriesConfigOptions> {
  generate(): Record<string, any> {
    if (Object.keys(this.options).length === 0) return {};

    const processAccessory = (config: AccessoryConfig): Record<string, any> => {
      const processed: Record<string, any> = {
        image: config.image,
        host: config.host,
        port: config.port
      };

      if (config.env) processed.env = config.env;
      if (config.files) processed.files = config.files;
      if (config.directories) processed.directories = config.directories;

      return processed;
    };

    const processedAccessories: Record<string, any> = {};
    for (const [key, config] of Object.entries(this.options)) {
      processedAccessories[key] = processAccessory(config);
    }

    return { accessories: processedAccessories };
  }
}

