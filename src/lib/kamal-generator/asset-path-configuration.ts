import { ConfigurationSection } from "./configuration-section.js";

export class AssetPathConfiguration extends ConfigurationSection<string> {

  generate(): Record<string, any> {
    if (this.options.length === 0) return {};
    return { asset_path: this.options };
  }
}

