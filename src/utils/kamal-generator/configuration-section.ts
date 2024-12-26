import { ConfigurationOptions } from "../../types/kamal-generator.js";

export abstract class ConfigurationSection<T extends ConfigurationOptions> {
  protected options: T;

  constructor(options: T) {
    this.options = options;
  }

  abstract generate(): Record<string, any>;
}

