import { BasicConfigOptions } from "../../types/kamal-generator.js";
import { ConfigurationSection } from "./configuration-section.js";

// Basic Configuration
export class BasicConfiguration extends ConfigurationSection<BasicConfigOptions> {
  generate(): Record<string, any> {
    const { serviceName = 'my-app', imageName = 'my-user/my-app' } = this.options;
    return {
      service: serviceName,
      image: imageName
    };
  }
}

