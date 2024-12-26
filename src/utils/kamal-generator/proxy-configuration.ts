import { ProxyConfigOptions } from "../../types/kamal-generator.js";
import { ConfigurationSection } from "./configuration-section.js";

// Proxy Configuration
export class ProxyConfiguration extends ConfigurationSection<ProxyConfigOptions> {
  generate(): Record<string, any> {
    const { ssl = true, host = 'app.example.com', appPort } = this.options;
    const proxy: Record<string, any> = {
      ssl,
      host
    };

    if (appPort) {
      proxy.app_port = appPort;
    }

    return { proxy };
  }
}

