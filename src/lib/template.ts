import * as fs from 'fs';
import * as path from 'path';
import { Framework, ShangoConfig } from '../types/index.js';
import { Git } from './git/git.js';

type Option = {
  framework: Framework,
  dockerfile: boolean;
  githubAction: boolean
};

export class Template {
  private options: Option;
  private templateDirName: string = '.shango-templates';
  private templateRepo: string = 'devalade/shango-templates';

  constructor(options: Option) {
    this.options = options;
  }

  private homeDir(): string {
    const homeDir = process.env.HOME || process.env.USERPROFILE;
    if (!homeDir) {
      throw new Error('Could not determine home directory');
    }

    return homeDir;
  }

  private templateDir(): string {
    const templateDir = this.homeDir() + '/' + this.templateDirName;
    if (!fs.existsSync(templateDir)) {
      this.cloneTemplateRepo(templateDir);
    }
    return templateDir;
  }

  private getFrameworkDir(): string {
    return path.join(this.templateDir(), this.options.framework);
  }

  private getShellConfigFile(): string {
    const shellConfigFile = fs.existsSync(path.join(this.homeDir(), '.bashrc')) ? '.bashrc' :
      fs.existsSync(path.join(this.homeDir(), '.bash_profile')) ? '.bash_profile' :
        fs.existsSync(path.join(this.homeDir(), '.zshrc')) ? '.zshrc' : null;
    if (!shellConfigFile) {
      throw new Error('No suitable shell configuration file found');
    }
    return shellConfigFile;
  }

  private cloneTemplateRepo(templateDir: string): void {
    Git.clone(this.templateRepo, templateDir);
    const shellConfigPath = path.join(this.homeDir(), this.getShellConfigFile());
    const exportLine = `export SHANGO_TEMPLATE=${this.templateDir()}`;
    const shellConfigContent = fs.readFileSync(shellConfigPath, 'utf8');

    if (!shellConfigContent.includes(exportLine)) {
      fs.appendFileSync(shellConfigPath, `\n${exportLine}\n`);
    }
  }

  private copyDockerfile() {
    const dockerfilePath = path.join(this.getFrameworkDir(), 'Dockerfile');
    const destinationPath = path.join(process.cwd(), 'Dockerfile');

    if (!fs.existsSync(dockerfilePath)) {
      throw new Error(`Dockerfile does not exist in the source directory: ${dockerfilePath}`);
    }

    fs.copyFileSync(dockerfilePath, destinationPath);
  }

  generate() {
    const { framework, dockerfile } = this.options;

    const validFrameworks: ShangoConfig['app']['framework'][] = [Framework.NEXTJS, Framework.REMIX, Framework.SVELTE, Framework.NESTJS, Framework.ADONISJS];
    if (!validFrameworks.includes(framework)) {
      throw new Error(`Invalid framework: ${framework}. Supported frameworks are: ${validFrameworks.join(', ')}`);
    }

    if (dockerfile) {
      this.copyDockerfile();
    }
  }
}
