import { RegistryConfigOptions } from "../../types/kamal-generator.js";
import { ConfigurationSection } from "./configuration-section.js";

// Registry Configuration
export class RegistryConfiguration extends ConfigurationSection<RegistryConfigOptions> {
  generate(): Record<string, any> {
    const {
      server = 'ghcr.io', username = 'my-user', passwordSecrets = ['KAMAL_REGISTRY_PASSWORD']
    } = this.options;

    return {
      registry: {
        server,
        username,
        password: passwordSecrets
      }
    };
  }
}

