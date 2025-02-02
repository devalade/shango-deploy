import { SSHManager } from '../ssh/ssh-manager.ts';

export class ServerRequirementsValidator {
  private ssh: SSHManager;

  constructor(ssh: SSHManager) {
    this.ssh = ssh;
  }

  async validateSystem(): Promise<void> {
    const checks = [
      this.checkDiskSpace(),
      this.checkMemory(),
      this.checkCPU(),
      this.checkOS(),
    ];

    await Promise.all(checks);
  }

  private async checkDiskSpace(): Promise<void> {
    const { stdout } = await this.ssh.executeCommand('df -h / | tail -1 | awk \'{print $5}\'');
    const usedSpace = parseInt(stdout.trim().replace('%', ''));

    if (usedSpace > 85) {
      throw new Error(`Insufficient disk space: ${usedSpace}% used`);
    }
  }

  private async checkMemory(): Promise<void> {
    const { stdout } = await this.ssh.executeCommand('free -g | awk \'NR==2{print $2}\'');
    const totalMemGB = parseInt(stdout.trim());

    if (totalMemGB < 2) {
      throw new Error(`Insufficient memory: ${totalMemGB}GB RAM available`);
    }
  }

  private async checkCPU(): Promise<void> {
    const { stdout } = await this.ssh.executeCommand('nproc');
    const cpuCount = parseInt(stdout.trim());

    if (cpuCount < 1) {
      throw new Error(`Insufficient CPU cores: ${cpuCount} cores available`);
    }
  }

  private async checkOS(): Promise<void> {
    const { stdout } = await this.ssh.executeCommand('cat /etc/os-release');
    const isSupported = stdout.includes('Ubuntu') || stdout.includes('Debian');

    if (!isSupported) {
      throw new Error('Unsupported operating system. Only Ubuntu and Debian are supported.');
    }
  }
}
