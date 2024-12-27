import { writeFileSync } from 'fs';
import { join } from 'path';
import { stringify } from "yaml";
import { ConfigurationOptions, ConfigurationType } from "../../types/kamal-generator.js";
import { ConfigurationFactory } from "./configuration-factory.js";
import { ConfigurationSection } from "./configuration-section.js";

export class KamalYAMLConfigurationGenerator {
  private sections: Map<string, ConfigurationSection<any>>;

  constructor() {
    this.sections = new Map();
  }

  addSection(type: ConfigurationType, options: ConfigurationOptions): this {
    const section = ConfigurationFactory.createSection(type, options);
    this.sections.set(type, section);
    return this;
  }

  generate(): Record<string, any> {
    let config: Record<string, any> = {};

    for (const section of this.sections.values()) {
      config = {
        ...config,
        ...section.generate()
      };
    }

    writeFileSync(
      join(process.cwd(), 'config/deploy.yml'),
      stringify(config)
    );
    return config;
  }
}

