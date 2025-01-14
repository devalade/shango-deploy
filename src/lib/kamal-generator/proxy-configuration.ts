import { ProxyConfigOptions } from "../../types/kamal-generator.js";
import { ConfigurationSection } from "./configuration-section.js";

export class ProxyConfiguration extends ConfigurationSection<ProxyConfigOptions> {
  generate(): Record<string, any> {
    const { ssl = true, host = 'app.example.com', appPort, healthcheck = { path: '/', interval: 5 } } = this.options;
    const proxy: Record<string, any> = {
      ssl,
      host,
      healthcheck: {
        path: healthcheck.path,
        interval: 5
      }
    };

    if (appPort) {
      proxy.app_port = appPort;
    }

    return { proxy };
  }
}

