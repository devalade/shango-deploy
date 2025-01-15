import { Client } from 'ssh2';
import * as fs from 'fs';
import * as path from 'path';
import { HookManager } from '../lib/hooks/hook-manager.js';
import { HookType } from 'src/lib/hooks/types.js';

interface DeployOptions {
  host: string;
  username: string;
  key: string;
  path: string;
}

export async function deploy(options: DeployOptions): Promise<void> {
  const { host, username, key, path: appPath } = options;

  if (!host || !username || !key || !appPath) {
    console.error('Missing required parameters');
    process.exit(1);
  }

  const conn = new Client();
  const hookManager = new HookManager();

  try {
    await hookManager.executeHooks(HookType.PRE_DEPLOY);
    await new Promise<void>((resolve, reject) => {
      conn.on('ready', () => {
        console.log('SSH Connection established');
        resolve();
      }).on('error', (err) => {
        reject(err);
      }).connect({
        host,
        username,
        privateKey: fs.readFileSync(key)
      });
    });

    // TODO: Implement deployment logic here
    console.log('Starting deployment...');

    await hookManager.executeHooks(HookType.POST_DEPLOY, [options.host]);


  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  } finally {
    conn.end();
  }
}
