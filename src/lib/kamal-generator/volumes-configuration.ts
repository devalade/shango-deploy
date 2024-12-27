import { ConfigurationSection } from "./configuration-section.js";

export class VolumesConfiguration extends ConfigurationSection<string[]> {
  generate(): Record<string, any> {
    if (this.options.length === 0) return {};
    return { volumes: this.options };
  }
}

