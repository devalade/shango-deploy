import { Git } from "./git.js";
import { Github } from "./github.js";

export class RepositoryService {
  private git: Git;
  private github: Github;

  constructor(projectPath: string) {
    this.git = new Git(projectPath);
    this.github = new Github(projectPath);
  }

  initializeGithubRepository(repoName: string, isPrivate: boolean = false): void {
    if (!this.git.isGitInitialized()) {
      this.git.init();
    }

    this.github.createRepository(repoName, isPrivate);
  }
}
