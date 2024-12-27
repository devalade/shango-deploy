import { execSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';

export class Github {
  private projectPath: string;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  private installGithubCli(): void {
    const platform = os.platform();

    switch (platform) {
      case 'darwin':
        execSync('brew install gh');
        break;
      case 'linux':
        if (fs.existsSync('/etc/debian_version')) {
          execSync('curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg');
          execSync('echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null');
          execSync('sudo apt update');
          execSync('sudo apt install gh');
        } else if (fs.existsSync('/etc/fedora-release')) {
          execSync('sudo dnf install gh');
        }
        break;
      case 'win32':
        execSync('winget install --id GitHub.cli');
        break;
      default:
        throw new Error('Unsupported platform for automatic GitHub CLI installation');
    }
  }

  isGithubCliInstalled(): boolean {
    try {
      execSync('gh --version');
      return true;
    } catch {
      return false;
    }
  }

  isAuthenticated(): boolean {
    try {
      execSync('gh auth status');
      return true;
    } catch {
      return false;
    }
  }

  createRepository(repoName: string, isPrivate: boolean = false): void {
    if (!this.isGithubCliInstalled()) {
      this.installGithubCli();
    }

    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with GitHub. Run "gh auth login" first');
    }

    const visibility = isPrivate ? '--private' : '--public';
    execSync(`gh repo create ${repoName} ${visibility} --source="${this.projectPath}" --remote=origin --push`);
  }
} 
