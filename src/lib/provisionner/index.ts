import { ShangoConfig } from '../../types/index.js';
import { executeSsh2Command as executeCommand } from '../../util/execute-ssh2-command.js';

export class ServerProvisioner {
  private config: ShangoConfig;
  private servers: string[];

  constructor(config: ShangoConfig) {
    this.config = config;
    this.servers = config.servers.flatMap(server => server.hosts.map(host => host));
  }

  async provision(): Promise<void> {
    for (const server of this.servers) {
      console.log(`🚀 Provisioning server: ${server}`);
      await this.executeProvisioningSteps(server);
    }
  }

  private async executeProvisioningSteps(server: string): Promise<void> {
    const steps = [
      { name: 'Setup Timezone', command: this.getSetupTimezoneCommand() },
      { name: 'Update APT Packages', command: this.getUpdateAptCommand() },
      { name: 'Install APT Packages', command: this.getInstallAptPackagesCommand() },
      { name: 'Setup NTP', command: this.getSetupNTPCommand() },
      { name: 'Install Fail2Ban', command: this.getInstallFail2BanCommand() },
      { name: 'Setup Swap', command: this.getSetupSwapCommand() },
      { name: 'Harden SSH', command: this.getHardenSSHCommand() },
      { name: 'Harden System', command: this.getHardenSystemCommand() },
      { name: 'Setup UFW', command: this.getSetupUFWCommand() },
      { name: 'Setup Postfix', command: this.getSetupPostfixCommand() },
      { name: 'Setup Logwatch', command: this.getSetupLogwatchCommand() },
      { name: 'Setup Docker', command: this.getSetupDockerCommand() },
    ];

    for (const step of steps) {
      try {
        console.log(`📋 Executing: ${step.name}`);
        await executeCommand(server, step.command);
        console.log(`✅ Completed: ${step.name}`);
      } catch (error) {
        console.error(`❌ Failed: ${step.name}`, error);
        throw error;
      }
    }
  }

  private getSetupTimezoneCommand(): string {
    return `
      timedatectl set-timezone UTC
      systemctl restart systemd-timesyncd
    `;
  }

  private getUpdateAptCommand(): string {
    return `
      apt-get update
      apt-get upgrade -y
      apt-get dist-upgrade -y
    `;
  }

  private getInstallAptPackagesCommand(): string {
    return `
      apt-get install -y \
      curl \
      wget \
      git \
      vim \
      htop \
      net-tools \
      unzip \
      software-properties-common
    `;
  }

  private getSetupNTPCommand(): string {
    return `
      apt-get install -y ntp
      systemctl enable ntp
      systemctl start ntp
    `;
  }

  private getInstallFail2BanCommand(): string {
    return `
      apt-get install -y fail2ban
      cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
      systemctl enable fail2ban
      systemctl start fail2ban
    `;
  }

  private getSetupSwapCommand(): string {
    return `
      fallocate -l 2G /swapfile
      chmod 600 /swapfile
      mkswap /swapfile
      swapon /swapfile
      echo '/swapfile none swap sw 0 0' >> /etc/fstab
    `;
  }

  private getHardenSSHCommand(): string {
    return `
      sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
      sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
      systemctl restart sshd
    `;
  }

  private getHardenSystemCommand(): string {
    return `
      echo "net.ipv4.conf.all.rp_filter=1" >> /etc/sysctl.conf
      echo "net.ipv4.conf.default.rp_filter=1" >> /etc/sysctl.conf
      echo "net.ipv4.icmp_echo_ignore_broadcasts=1" >> /etc/sysctl.conf
      sysctl -p
    `;
  }

  private getSetupUFWCommand(): string {
    return `
      apt-get install -y ufw
      ufw default deny incoming
      ufw default allow outgoing
      ufw allow ssh
      ufw allow http
      ufw allow https
      ufw enable
    `;
  }

  private getSetupPostfixCommand(): string {
    return `
      debconf-set-selections <<< "postfix postfix/mailname string ${this.config.app.domain}"
      debconf-set-selections <<< "postfix postfix/main_mailer_type string 'Internet Site'"
      apt-get install -y postfix
    `;
  }

  private getSetupLogwatchCommand(): string {
    return `
      apt-get install -y logwatch
      echo "/usr/sbin/logwatch --output mail --mailto root --detail high" > /etc/cron.daily/00logwatch
    `;
  }

  private getSetupDockerCommand(): string {
    return `
      curl -fsSL https://get.docker.com -o get-docker.sh
      sh get-docker.sh
      systemctl enable docker
      systemctl start docker
      usermod -aG docker $USER
    `;
  }


  private async createUsers(): Promise<void> {
    for (const user of this.config.users) {
      const commands = [
        // Create user with home directory
        `useradd -m ${user.username} ${user.create_home ? '-m' : ''}`,

        // Add to groups
        ...user.groups.map(group => `usermod -aG ${group} ${user.username}`),

        // Set up SSH directory
        `mkdir -p /home/${user.username}/.ssh`,
        `chmod 700 /home/${user.username}/.ssh`,

        // Add SSH keys
        `echo "${user.ssh_keys.join('\n')}" > /home/${user.username}/.ssh/authorized_keys`,
        `chmod 600 /home/${user.username}/.ssh/authorized_keys`,
        `chown -R ${user.username}:${user.username} /home/${user.username}/.ssh`,

        // Force password change if needed
        ...(user.force_password_change ? [`chage -d 0 ${user.username}`] : [])
      ];


      for (let index = 0; index < this.servers.length; index++) {
        for (const command of commands) {
          await executeCommand(this.servers[index], command);
        }
      }
    }
  }
}
