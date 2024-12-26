import { ServerConfig } from "../../types/kamal-generator.js";
import { ConfigurationSection } from "./configuration-section.js";

export class ServersConfiguration extends ConfigurationSection<ServerConfig> {
  generate(): Record<string, any> {
    return {
      servers: this.options
    };
  }
}

