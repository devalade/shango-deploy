import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { Hook, HookType, HookContext, HookResult, HookError } from './types.js';
import { SSHManager } from '../ssh/ssh-manager.js';

export class HookManager {
  private readonly hooksDir: string;
  private readonly env: Record<string, string>;

  constructor(
    hooksDir: string = join(process.cwd(), '.kamal', 'hooks'),
    env: Record<string, string> = {}
  ) {
    this.hooksDir = hooksDir;
    this.env = {
      ...process.env,
      ...env,
      KAMAL_RECORDED_AT: new Date().toISOString(),
      KAMAL_PERFORMER: process.env.USER || 'unknown'
    };
  }

  async executeHook(hook: Hook, servers?: string[]): Promise<HookResult> {
    const startTime = Date.now();

    try {
      console.log(`Executing ${hook.type} hook: ${hook.name}`);

      if (hook.condition && !this.evaluateCondition(hook.condition)) {
        console.log(`Skipping hook ${hook.name}: condition not met`);
        return {
          success: true,
          output: 'Hook skipped: condition not met',
          duration: Date.now() - startTime
        };
      }

      let output: string;
      if (hook.context === HookContext.LOCAL) {
        output = await this.executeLocal(hook);
      } else {
        if (!servers || servers.length === 0) {
          throw new HookError('No servers provided for remote hook execution', hook);
        }
        output = await this.executeRemote(hook, servers);
      }

      return {
        success: true,
        output,
        duration: Date.now() - startTime
      };

    } catch (error: any) {
      const result = {
        success: false,
        output: error.message,
        error,
        duration: Date.now() - startTime
      };
      throw new HookError(`Hook execution failed: ${error.message}`, hook, result);
    }
  }

  async executeHooks(type: HookType, servers?: string[]): Promise<HookResult[]> {
    const hooks = await this.loadHooks(type);
    const results: HookResult[] = [];

    for (const hook of hooks) {
      try {
        const result = await this.executeHook(hook, servers);
        results.push(result);
      } catch (error) {
        if (error instanceof HookError) {
          console.error(`Hook ${hook.name} failed: ${error.message}`);
          if (error.result) {
            results.push(error.result);
          }
        }
        throw error; // Re-throw to stop execution if a hook fails
      }
    }

    return results;
  }

  private async loadHooks(type: HookType): Promise<Hook[]> {
    const hooks: Hook[] = [];
    const hookPath = join(this.hooksDir, `${type}.sh`);

    if (!existsSync(hookPath)) {
      return hooks;
    }

    const script = readFileSync(hookPath, 'utf8');

    hooks.push({
      name: type,
      type,
      script,
      context: this.determineContext(script),
      timeout: this.parseTimeout(script)
    });

    return hooks;
  }

  private async executeLocal(hook: Hook): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const output = execSync(hook.script, {
          env: this.env,
          timeout: hook.timeout || 30000,
          encoding: 'utf8'
        });
        resolve(output);
      } catch (error: any) {
        reject(new Error(`Local execution failed: ${error.message}`));
      }
    });
  }

  private async executeRemote(hook: Hook, servers: string[]): Promise<string> {
    const outputs: string[] = [];

    for (const server of servers) {
      const ssh = new SSHManager({ host: server, username: 'root' });
      try {
        await ssh.connect();
        const { stdout } = await ssh.executeCommand(hook.script, {
          timeout: hook.timeout
        });
        outputs.push(`[${server}] ${stdout}`);
      } finally {
        ssh.disconnect();
      }
    }

    return outputs.join('\n');
  }

  private evaluateCondition(condition: string): boolean {
    try {
      // Simple evaluation - could be enhanced for more complex conditions
      return !!eval(condition);
    } catch {
      return false;
    }
  }

  private determineContext(script: string): HookContext {
    // Look for special comments in the script to determine context
    if (script.includes('#@remote')) {
      return HookContext.REMOTE;
    }
    return HookContext.LOCAL;
  }

  private parseTimeout(script: string): number | undefined {
    const timeoutMatch = script.match(/#@timeout (\d+)/);
    return timeoutMatch ? parseInt(timeoutMatch[1], 10) : undefined;
  }
}
