import { SSHManager } from "../ssh/ssh-manager.ts";
import { ServerRequirementsValidator } from "./requirements-validator.ts";
import { type User } from "../../types/index.ts";

export class ServerSetup {
  private ssh: SSHManager;
  private validator: ServerRequirementsValidator;

  constructor(ssh: SSHManager) {
    this.ssh = ssh;
    this.validator = new ServerRequirementsValidator(ssh);
  }

  async validateRequirements(): Promise<void> {
    await this.validator.validateSystem();
  }

  async updateSystem(): Promise<void> {
    console.log('📥 Updating system packages...');
    const commands = [
      'apt-get update',
      'DEBIAN_FRONTEND=noninteractive apt-get upgrade -y',
      'apt-get install -y curl wget git vim htop net-tools unzip ufw'
    ];

    for (const command of commands) {
      await this.ssh.executeCommand(command);
    }
  }

  async setupFirewall(): Promise<void> {
    console.log('🛡️ Setting up firewall...');
    const commands = [
      'ufw default deny incoming',
      'ufw default allow outgoing',
      'ufw allow ssh',
      'ufw allow http',
      'ufw allow https',
      'echo "y" | ufw enable'
    ];

    for (const command of commands) {
      await this.ssh.executeCommand(command);
    }
  }

  async setupDocker(): Promise<void> {
    console.log('🐳 Installing Docker...');
    const commands = [
      'curl -fsSL https://get.docker.com -o get-docker.sh',
      'sh get-docker.sh',
      'systemctl enable docker',
      'systemctl start docker',
      'docker --version' // Verify installation
    ];

    for (const command of commands) {
      await this.ssh.executeCommand(command);
    }
  }

  async setupUsers(users: User[]): Promise<void> {
    console.log('👥 Setting up users...');
    for (const user of users) {
      const commands = [
        `id -u ${user.username} &>/dev/null || useradd -m -s /bin/bash ${user.username}`,
        ...user.groups.map(group => `usermod -aG ${group} ${user.username}`),
        `mkdir -p /home/${user.username}/.ssh`,
        `chmod 700 /home/${user.username}/.ssh`,
        `echo "${user.ssh_keys.join('\n')}" > /home/${user.username}/.ssh/authorized_keys`,
        `chmod 600 /home/${user.username}/.ssh/authorized_keys`,
        `chown -R ${user.username}:${user.username} /home/${user.username}/.ssh`
      ];

      if (user.force_password_change) {
        commands.push(`chage -d 0 ${user.username}`);
      }

      for (const command of commands) {
        await this.ssh.executeCommand(command);
      }
    }
  }

  async setupMonitoring(): Promise<void> {
    console.log('📊 Setting up monitoring...');
    const commands = [
      'apt-get install -y prometheus-node-exporter',
      'systemctl enable prometheus-node-exporter',
      'systemctl start prometheus-node-exporter'
    ];

    for (const command of commands) {
      await this.ssh.executeCommand(command);
    }
  }
}
