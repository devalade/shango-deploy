import { Framework, TemplateOptions } from '../../types/index.js';
import { DockerfileTemplate } from './dockerfile.js';
import { GithubActionsTemplate } from './github-actions.js';
import { BaseTemplate } from './base.js';
import { validateTemplateOptions } from './validator.js';

export class TemplateManager {
  private options: TemplateOptions;
  private templates: BaseTemplate[] = [];

  constructor(options: TemplateOptions) {
    this.options = validateTemplateOptions(options);
    this.initializeTemplates();
  }

  private initializeTemplates(): void {
    if (this.options.dockerfile) {
      this.templates.push(new DockerfileTemplate(this.options));
    }

    if (this.options.githubAction) {
      this.templates.push(new GithubActionsTemplate(this.options));
    }
  }

  async generate(): Promise<void> {
    for (const template of this.templates) {
      await template.generate();
    }
  }
}
