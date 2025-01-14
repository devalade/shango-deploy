import { execSync } from 'child_process';
import { Hook } from '../types/index.js';
import { executeSsh2Command } from '../util/execute-ssh2-command.js';

export class HookExecutor {
  async executeHooks(hooks: Hook[], server?: string): Promise<void> {
    for (const hook of hooks) {
      if (hook.local) {
        await this.executeLocal(hook);
      }
      if (hook.remote && server) {
        await this.executeRemote(hook, server);
      }
    }
  }

  private async executeLocal(hook: Hook): Promise<void> {
    try {
      console.log(`Executing local hook: ${hook.command}`);
      execSync(hook.command, { stdio: 'inherit' });
    } catch (error) {
      throw new Error(`Failed to execute local hook: ${hook.command}`);
    }
  }

  private async executeRemote(hook: Hook, server: string): Promise<void> {
    try {
      console.log(`Executing remote hook on ${server}: ${hook.command}`);
      await executeSsh2Command(server, hook.command);
    } catch (error) {
      throw new Error(`Failed to execute remote hook on ${server}: ${hook.command}`);
    }
  }
}
