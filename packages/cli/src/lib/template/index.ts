import { Framework, type TemplateOptions } from '../../types/index.ts';
import { DockerfileTemplate } from './dockerfile.ts';
import { GithubActionsTemplate } from './github-action.ts';
import { BaseTemplate } from './base.ts';
import { validateTemplateOptions } from './validator.ts';
import { execSync } from 'child_process';
import { existsSync } from 'fs';

export class TemplateManager {
  private templateFolder: string = '$HOME/.shango-templates';
  private options: TemplateOptions;
  private templates: BaseTemplate[] = [];

  constructor(options: TemplateOptions) {
    this.options = validateTemplateOptions(options);
    this.setupTemplateFolder();
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

  private setupTemplateFolder() {
    if (existsSync(this.templateFolder)) return;
    try {
      execSync(
        `git clone https://github.com/devalade/shango-templates ${this.templateFolder}`,
      );
      console.log('Repository cloned successfully:');
    } catch (error) {
      console.error('Failed to setup the ');
    }
  }

  async generate(): Promise<void> {
    for (const template of this.templates) {
      await template.generate();
    }
  }
}
