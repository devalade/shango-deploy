import { BuilderConfigOptions } from "../../types/kamal-generator.js";
import { ConfigurationSection } from "./configuration-section.js";

// Builder Configuration
export class BuilderConfiguration extends ConfigurationSection<BuilderConfigOptions> {
  generate(): Record<string, any> {
    const { arch = 'amd64', args = {} } = this.options;
    const builder: Record<string, any> = {
      arch
    };

    if (Object.keys(args).length > 0) {
      builder.args = args;
    }

    return { builder };
  }
}

