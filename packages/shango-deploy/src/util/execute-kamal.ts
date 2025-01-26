import { execSync } from 'child_process';
import { homedir, tmpdir } from 'os';
import path from 'path';

/**
 * Executes a Kamal command inside a Docker container.
 *
 * This function constructs a Docker run command to execute the specified Kamal command
 * within a Docker container. It sets up the necessary environment variables and volume
 * mounts to ensure the command runs with the correct user permissions and access to
 * the current working directory and SSH agent.
 *
 * @param {string | string[]} command - The Kamal command to execute. Can be a string or an array of strings.
 * @returns {string} - The output of the executed command.
 * @throws {Error} - Throws an error if the Kamal command execution fails.
 */
export function executeKamal(command: string | string[]) {
  const sshPath = path.join(homedir(), '.ssh');
  const dockerConfigPath = path.join(tmpdir(), '.docker');
  const sshAuthSock = process.env.SSH_AUTH_SOCK;

  try {
    execSync(`mkdir -p ${dockerConfigPath} && chmod 777 ${dockerConfigPath}`);
  } catch (error) {
    console.warn('Warning: Could not create .docker directory');
  }

  // Get the group ID of the docker group
  const dockerGroupId = execSync('getent group docker | cut -d: -f3').toString().trim();

  const baseCommand = [
    'docker run --rm',
    '-it',
    `-u "$(id -u):${dockerGroupId}"`,
    `-v "${process.cwd()}:/workdir"`,
    `-v "${sshPath}:/root/.ssh:ro"`,
    `-v "${dockerConfigPath}:/.docker"`,
    `-v "${sshAuthSock}:/ssh-agent"`,
    '-e SSH_AUTH_SOCK=/ssh-agent',
    `-e DOCKER_CONFIG=${dockerConfigPath}`,
    '-v /var/run/docker.sock:/var/run/docker.sock',
    'ghcr.io/basecamp/kamal:latest'
  ].join(' ');

  if (Array.isArray(command)) {
    command = command.join(' ');
  }

  try {
    const output = execSync(`${baseCommand} ${command}`, {
      encoding: 'utf8',
      stdio: 'inherit',
      shell: '/bin/bash',
      env: {
        ...process.env,
        SSH_AUTH_SOCK: '/ssh-agent',
        DOCKER_CONFIG: dockerConfigPath
      }
    });
    return output;
  } catch (error: any) {
    throw new Error(`Kamal command failed: ${error.message}`);
  }
}
