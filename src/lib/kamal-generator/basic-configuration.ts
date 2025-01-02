import { BasicConfigOptions } from "../../types/kamal-generator.js";
import { ConfigurationSection } from "./configuration-section.js";

export class BasicConfiguration extends ConfigurationSection<BasicConfigOptions> {
  generate(): Record<string, any> {
    const { serviceName = 'my-app', imageName = 'my-user/my-app', assetPath = '' } = this.options;
    return {
      service: serviceName,
      image: imageName,
      asset_path: assetPath
    };
  }
}

