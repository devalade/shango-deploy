import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export class Git {
  private projectPath: string;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  static getGlobalUsername(): string {
    try {
      return execSync('git config --global user.name')
        .toString()
        .trim();
    } catch {
      throw new Error('Global git username not configured');
    }
  }

  isGitInitialized(): boolean {
    return fs.existsSync(path.join(this.projectPath, '.git'));
  }

  init(): void {
    if (this.isGitInitialized()) {
      throw new Error('Git repository already initialized');
    }
    execSync('git init', { cwd: this.projectPath });
  }

  addRemote(name: string, url: string): void {
    execSync(`git remote add ${name} ${url}`, { cwd: this.projectPath });
  }

  getRemoteUrl(name: string = 'origin'): string {
    return execSync(`git config --get remote.${name}.url`, { cwd: this.projectPath })
      .toString()
      .trim();
  }

  push(remote: string = 'origin', branch: string = 'main'): void {
    execSync(`git push -u ${remote} ${branch}`, { cwd: this.projectPath });
  }
}
