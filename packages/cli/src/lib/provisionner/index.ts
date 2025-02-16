import { type ShangoConfig } from '../../types/index.ts';
import { ServerSetup } from './server-setup.ts';
import { HookManager } from '../hooks/hook-manager.ts';
import { SSHManager, type SSHConfig } from '../ssh/ssh-manager.ts';
import { HookType } from '../hooks/types.ts';

export class ServerProvisioner {
  private config: ShangoConfig;
  private hookManager: HookManager;
  private sshConfig: Omit<SSHConfig, 'password' | 'host'>;

  constructor(
    config: ShangoConfig,
    sshConfig: Omit<SSHConfig, 'password' | 'host'>,
  ) {
    this.config = config;
    this.hookManager = new HookManager();
    this.sshConfig = sshConfig;
  }

  async provision(): Promise<void> {
    try {
      // Execute pre-provision hooks
      await this.hookManager.executeHooks(HookType.PRE_PROVISION);

      // Provision each server in each environment
      for (const serverConfig of this.config.servers) {
        console.log(
          `\n🚀 Provisioning ${serverConfig.environment} environment...`,
        );

        for (const host of serverConfig.hosts) {
          console.log(`\n📦 Setting up server: ${host}`);

          const ssh = new SSHManager({
            host,
            ...this.sshConfig,
          });

          try {
            await ssh.connect();
            const setup = new ServerSetup(ssh);

            // Run setup steps in sequence
            await setup.validateRequirements();
            await setup.updateSystem();
            await setup.setupFirewall();
            await setup.setupDocker();
            await setup.setupUsers(this.config.users);
            await setup.setupMonitoring();

            console.log(`✅ Server ${host} provisioned successfully`);
          } catch (error) {
            console.error(`❌ Failed to provision ${host}:`, error);
            throw error;
          } finally {
            ssh.disconnect();
          }
        }
      }

      // Execute post-provision hooks
      await this.hookManager.executeHooks(HookType.POST_PROVISION);

      console.log('\n✨ Server provisioning completed successfully!');
    } catch (error) {
      console.error('Error during provisioning:', error);
      throw error;
    }
  }
}
