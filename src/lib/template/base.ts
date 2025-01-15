import { TemplateOptions } from '../../types/index.js';

export abstract class BaseTemplate {
  protected options: TemplateOptions;

  constructor(options: TemplateOptions) {
    this.options = options;
  }

  abstract generate(): Promise<void>;
  abstract validate(): boolean;
}
