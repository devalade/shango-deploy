import { Client, type ClientChannel } from 'ssh2';
import { readFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

export interface SSHConfig {
  host: string;
  username: string;
  privateKey?: string;
  password?: string;
  port?: number;
}

export class SSHManager {
  private config: SSHConfig;
  private client: Client;

  constructor(config: SSHConfig) {
    this.config = {
      port: 22,
      ...config
    };
    this.client = new Client();
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        let privateKey: Buffer | undefined;

        if (this.config.privateKey) {
          privateKey = readFileSync(this.config.privateKey);
        } else {
          // Try default SSH key locations
          const defaultKeyPaths = [
            join(homedir(), '.ssh', 'id_rsa'),
            join(homedir(), '.ssh', 'id_ed25519')
          ];

          for (const keyPath of defaultKeyPaths) {
            try {
              privateKey = readFileSync(keyPath);
              break;
            } catch (error) {
              continue;
            }
          }
        }

        this.client
          .on('ready', () => {
            resolve();
          })
          .on('error', (err) => {
            reject(new Error(`SSH connection error: ${err.message}`));
          })
          .connect({
            host: this.config.host,
            port: this.config.port,
            username: this.config.username,
            privateKey,
            password: this.config.password
          });
      } catch (error) {
        reject(new Error(`Failed to establish SSH connection: ${error}`));
      }
    });
  }

  async executeCommand(command: string, options: { timeout?: number } = {}): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      const timeout = options.timeout || 30000; // Default 30s timeout
      let timer: NodeJS.Timeout;

      this.client.exec(command, (err: Error | undefined, stream: ClientChannel) => {
        if (err) {
          reject(new Error(`Failed to execute command: ${err.message}`));
          return;
        }

        let stdout = '';
        let stderr = '';

        stream.on('data', (data: Buffer) => {
          stdout += data.toString();
        });

        stream.stderr.on('data', (data: Buffer) => {
          stderr += data.toString();
        });

        stream.on('close', (code: number) => {
          clearTimeout(timer);
          if (code === 0) {
            resolve({ stdout, stderr });
          } else {
            reject(new Error(`Command failed with code ${code}: ${stderr}`));
          }
        });

        timer = setTimeout(() => {
          stream.destroy();
          reject(new Error(`Command timed out after ${timeout}ms`));
        }, timeout);
      });
    });
  }

  disconnect(): void {
    this.client.end();
  }
}
