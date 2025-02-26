import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { BaseTemplate } from './base.ts';
import { TemplateError } from './error.ts';
import { Framework } from '../../types/index.ts';

export class DockerfileTemplate extends BaseTemplate {
  private getDockerfileTemplate(): string {
    const templatePath = join(
      process.env.HOME!,
      this.options.templateDir,
      this.options.framework,
      'Dockerfile',
    );

    try {
      return readFileSync(templatePath, 'utf8');
    } catch (error) {
      throw new TemplateError(`Failed to read Dockerfile template: ${error}`);
    }
  }

  private processTemplate(template: string): string {
    // Add template variables based on framework
    const variables: Record<string, string> = {
      NODE_VERSION: '18',
      ...this.getFrameworkSpecificVariables(),
    };

    return template.replace(/\${(\w+)}/g, (_, key) => variables[key] || '');
  }

  private getFrameworkSpecificVariables(): Record<string, string> {
    switch (this.options.framework) {
      case Framework.NEXTJS:
        return {
          BUILD_COMMAND: 'npm run build',
          START_COMMAND: 'npm start',
        };
      // Add other frameworks
      default:
        return {};
    }
  }

  validate(): boolean {
    if (!this.options.framework) {
      throw new TemplateError('Framework is required for Dockerfile template');
    }
    return true;
  }

  async generate(): Promise<void> {
    this.validate();

    const template = this.getDockerfileTemplate();
    const processedTemplate = this.processTemplate(template);

    try {
      writeFileSync(join(process.cwd(), 'Dockerfile'), processedTemplate);
    } catch (error) {
      throw new TemplateError(`Failed to write Dockerfile: ${error}`);
    }
  }
}
