import { type TemplateOptions } from '../../types/index.ts';

export abstract class BaseTemplate {
  protected options: TemplateOptions;

  constructor(options: TemplateOptions) {
    this.options = options;
  }

  abstract generate(): Promise<void>;
  abstract validate(): boolean;
}
