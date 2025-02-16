import ora, { type Ora } from 'ora';
import chalk from 'chalk';

export interface TaskProgress {
  step: number;
  total: number;
  description: string;
  status: 'running' | 'success' | 'failed' | 'skipped';
  output?: string;
  error?: string;
}

export class ProgressReporter {
  private spinner: Ora | null = null;
  private startTime: number = 0;

  startTask(progress: TaskProgress): void {
    this.startTime = Date.now();
    const text = this.formatProgressText(progress);

    this.spinner = ora({
      text,
      color: 'yellow',
      spinner: 'dots',
    }).start();
  }

  updateOutput(output: string): void {
    if (this.spinner) {
      // Only show the last line of output if it's a multi-line string
      const lines = output.trim().split('\n');
      const lastLine = lines[lines.length - 1];
      this.spinner.text = `${this.spinner.text} | ${lastLine}`;
    }
  }

  finishTask(status: 'success' | 'failed' | 'skipped', error?: any): void {
    if (!this.spinner) return;

    const duration = ((Date.now() - this.startTime) / 1000).toFixed(1);
    const durationText = chalk.gray(`(${duration}s)`);

    switch (status) {
      case 'success':
        this.spinner.succeed(
          chalk.green(`${this.spinner.text} ${durationText}`),
        );
        break;
      case 'failed':
        this.spinner.fail(chalk.red(`${this.spinner.text} ${durationText}`));
        if (error) {
          console.error(chalk.red(`Error: ${error}`));
        }
        break;
      case 'skipped':
        this.spinner.info(chalk.blue(`${this.spinner.text} ${durationText}`));
        break;
    }

    this.spinner = null;
  }

  private formatProgressText(progress: TaskProgress): string {
    return `[${progress.step}/${progress.total}] ${progress.description}`;
  }
}
