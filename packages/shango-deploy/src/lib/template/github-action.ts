import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { BaseTemplate } from './base.ts';
import { TemplateError } from './error.ts';

export class GithubActionsTemplate extends BaseTemplate {
  private getWorkflowTemplate(): string {
    const templatePath = join(
      this.options.templateDir,
      'github-actions',
      'deploy.yml'
    );

    try {
      return readFileSync(templatePath, 'utf8');
    } catch (error) {
      throw new TemplateError(`Failed to read GitHub Actions template: ${error}`);
    }
  }

  private processTemplate(template: string): string {
    const variables: Record<string, string> = {
      APP_NAME: this.options.appName,
      GITHUB_USERNAME: this.options.githubUsername,
      ...this.getEnvironmentVariables(),
    };

    return template.replace(/\${(\w+)}/g, (_, key) => variables[key] || '');
  }

  private getEnvironmentVariables(): Record<string, string> {
    return {
      REGISTRY: 'ghcr.io',
      DOCKER_IMAGE: `ghcr.io/${this.options.githubUsername}/${this.options.appName}`,
    };
  }

  validate(): boolean {
    if (!this.options.githubUsername || !this.options.appName) {
      throw new TemplateError('GitHub username and app name are required for GitHub Actions template');
    }
    return true;
  }

  async generate(): Promise<void> {
    this.validate();

    const template = this.getWorkflowTemplate();
    const processedTemplate = this.processTemplate(template);

    try {
      const workflowDir = join(process.cwd(), '.github', 'workflows');
      mkdirSync(workflowDir, { recursive: true });
      writeFileSync(join(workflowDir, 'deploy.yml'), processedTemplate);
    } catch (error) {
      throw new TemplateError(`Failed to write GitHub Actions workflow: ${error}`);
    }
  }
}
