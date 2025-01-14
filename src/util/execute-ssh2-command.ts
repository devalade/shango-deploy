import { Client } from 'ssh2';

function connect(config: { host: string, username: string, agent?: string }): Promise<{ exec: (cmd: string) => Promise<{ stdout: string, stderr: string }>, close: () => void }> {
  return new Promise((resolve, reject) => {
    const client = new Client();

    client.on('ready', () => {
      const exec = (cmd: string): Promise<{ stdout: string, stderr: string }> => {
        return new Promise((resolve, reject) => {
          client.exec(cmd, (err, channel) => {
            if (err) reject(err);

            let stdout = '';
            let stderr = '';

            channel.on('data', (data: any) => {
              stdout += data.toString();
            });

            channel.stderr.on('data', (data) => {
              stderr += data.toString();
            });

            channel.on('close', () => {
              resolve({ stdout, stderr });
            });
          });
        });
      };

      resolve({
        exec,
        close: () => client.end()
      });
    });

    client.on('error', reject);
    client.connect(config);
  });
}

export async function executeSsh2Command(server: string, command: string): Promise<string> {
  const ssh = await connect({
    host: server,
    username: 'root',
    agent: process.env.SSH_AUTH_SOCK
  });

  try {
    const { stdout, stderr } = await ssh.exec(command);
    if (stderr) {
      console.warn(`Warning: ${stderr}`);
    }
    return stdout;
  } finally {
    ssh.close();
  }
}
