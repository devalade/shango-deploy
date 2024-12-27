import { EnvironmentConfigOptions } from "../../types/kamal-generator.js";
import { ConfigurationSection } from "./configuration-section.js";

export class EnvironmentConfiguration extends ConfigurationSection<EnvironmentConfigOptions> {
  generate(): Record<string, any> {
    const { clear = {}, secret = [] } = this.options;
    if (Object.keys(clear).length === 0 && secret.length === 0) return {};

    return {
      env: {
        ...(Object.keys(clear).length > 0 && { clear }),
        ...(secret.length > 0 && { secret })
      }
    };
  }
}

