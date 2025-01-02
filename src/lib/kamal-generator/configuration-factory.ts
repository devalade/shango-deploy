import { ConfigurationType, BasicConfigOptions, ServerConfig, ProxyConfigOptions, RegistryConfigOptions, BuilderConfigOptions, EnvironmentConfigOptions, AccessoriesConfigOptions, ConfigurationOptionsByType } from "../../types/kamal-generator.js";
import { AccessoriesConfiguration } from "./accessories-configuration.js";
import { AssetPathConfiguration } from "./asset-path-configuration.js";
import { BasicConfiguration } from "./basic-configuration.js";
import { BuilderConfiguration } from "./builder-configuration.js";
import { ConfigurationSection } from "./configuration-section.js";
import { EnvironmentConfiguration } from "./environment-configuration.js";
import { ProxyConfiguration } from "./proxy-configuration.js";
import { RegistryConfiguration } from "./registry-configuration.js";
import { ServersConfiguration } from "./servers-configuration.js";
import { VolumesConfiguration } from "./volumes-configuration.js";

export class ConfigurationFactory {
  static createSection<T extends ConfigurationType>(type: T, options: ConfigurationOptionsByType<T>): ConfigurationSection<any> {
    switch (type) {
      case 'basic':
        return new BasicConfiguration(options as BasicConfigOptions);
      case 'servers':
        return new ServersConfiguration(options as ServerConfig);
      case 'proxy':
        return new ProxyConfiguration(options as ProxyConfigOptions);
      case 'registry':
        return new RegistryConfiguration(options as RegistryConfigOptions);
      case 'builder':
        return new BuilderConfiguration(options as BuilderConfigOptions);
      case 'env':
        return new EnvironmentConfiguration(options as EnvironmentConfigOptions);
      case 'accessories':
        return new AccessoriesConfiguration(options as AccessoriesConfigOptions);
      case 'volumes':
        return new VolumesConfiguration(options as string[]);
      case 'assets':
        return new AssetPathConfiguration(options as string);
      default:
        throw new Error(`Unknown configuration type: ${type}`);
    }
  }
}

