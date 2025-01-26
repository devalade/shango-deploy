import { type TemplateOptions } from '../../types/index.ts';
import { TemplateError } from './error.ts';

export function validateTemplateOptions(options: TemplateOptions): TemplateOptions {
  if (!options.framework) {
    throw new TemplateError('Framework is required');
  }

  if (!options.templateDir) {
    throw new TemplateError('Template directory is required');
  }

  return options;
}
