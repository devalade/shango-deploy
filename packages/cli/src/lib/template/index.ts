import { Framework, type TemplateOptions } from '../../types/index.ts';
import { DockerfileTemplate } from './dockerfile.ts';
import { GithubActionsTemplate } from './github-action.ts';
import { BaseTemplate } from './base.ts';
import { validateTemplateOptions } from './validator.ts';

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
