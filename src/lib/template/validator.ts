import { TemplateOptions } from '../../types/index.js';
import { TemplateError } from './errors.js';

export function validateTemplateOptions(options: TemplateOptions): TemplateOptions {
  if (!options.framework) {
    throw new TemplateError('Framework is required');
  }

  if (!options.templateDir) {
    throw new TemplateError('Template directory is required');
  }

  return options;
}
