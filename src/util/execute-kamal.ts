import { execSync } from 'node:child_process';

export function executeKamal(command: string | string[]) {
  const baseCommand = [
    'docker run --rm',
    `-u "$(id -u):$(id -g)"`,
    '-v "$PWD:/workdir"',
    '-v "$SSH_AUTH_SOCK:/ssh-agent"',
    '-v /var/run/docker.sock:/var/run/docker.sock',
    'ghcr.io/basecamp/kamal:latest'
  ].join(' ');

  if (Array.isArray(command)) {
    command = command.join(' ');
  }

  try {
    const output = execSync(`${baseCommand} ${command}`, {
      encoding: 'utf8',
      shell: '/bin/bash',
      env: { ...process.env }
    });
    return output;
  } catch (error: any) {
    throw new Error(`Kamal command failed: ${error.message}`);
  }
}
