import inquirer from 'inquirer';
import { Repository } from '../lib/git/repository.js';
import { executeKamal } from '../util/execute-kamal.js';

export async function kamal(cmd: string[]): Promise<void> {
  console.log('Kamal command is running');
  console.log('Command:', cmd);
  executeKamal(cmd);
  if (cmd.includes('setup')) {
    const projectPath = process.cwd();
    const repository = new Repository(projectPath);
    const answers = await inquirer.prompt<{ repoName: string; isPrivate: boolean }>([
      {
        type: 'input',
        name: 'repoName',
        message: 'Enter your repository name:',
      },
      {
        type: 'confirm',
        name: 'isPrivate',
        message: 'Is this repository private?',
      }
    ]);
    repository.initializeGithubRepository(answers.repoName, answers.isPrivate);
  }
}
