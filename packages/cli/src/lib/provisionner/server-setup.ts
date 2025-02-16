import { SSHManager } from '../ssh/ssh-manager.ts';
import { ServerRequirementsValidator } from './requirements-validator.ts';
import { type User } from '../../types/index.ts';
import { ProgressReporter } from '../progress-reporter/index.ts';

interface TaskResult {
  changed: boolean;
  failed: boolean;
  msg: string;
  retries?: number;
}

interface PackageState {
  name: string;
  state: 'present' | 'absent' | 'latest';
  version?: string;
}

export class ServerSetup {
  private ssh: SSHManager;
  private validator: ServerRequirementsValidator;
  private maxRetries = 3;
  private retryDelay = 5000; // 5 seconds
  private reporter: ProgressReporter;

  constructor(ssh: SSHManager) {
    this.ssh = ssh;
    this.validator = new ServerRequirementsValidator(ssh);
    this.reporter = new ProgressReporter();
  }

  private async executeWithRetry(
    command: string,
    description: string,
    step: number,
    total: number,
    check?: () => Promise<boolean>,
  ): Promise<TaskResult> {
    let retries = 0;
    this.reporter.startTask({
      step,
      total,
      description,
      status: 'running',
    });

    while (retries < this.maxRetries) {
      try {
        // Check if task needs to be executed
        if (check && !(await check())) {
          this.reporter.finishTask('skipped');
          return {
            changed: false,
            failed: false,
            msg: `Skipping: ${description} - already in desired state`,
          };
        }

        const { stdout } = await this.ssh.executeCommand(command);
        this.reporter.updateOutput(stdout);
        this.reporter.finishTask('success');
        return {
          changed: true,
          failed: false,
          msg: `Success: ${description}`,
          retries,
        };
      } catch (error) {
        retries++;
        if (retries === this.maxRetries) {
          this.reporter.finishTask('failed', error);
          return {
            changed: false,
            failed: true,
            msg: `Failed: ${description} - ${error}`,
            retries,
          };
        }
        await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
      }
    }
    return {
      changed: false,
      failed: true,
      msg: `Failed: ${description} - max retries reached`,
      retries,
    };
  }

  private async checkPackage(packageName: string): Promise<boolean> {
    try {
      const { stdout } = await this.ssh.executeCommand(
        `dpkg -l ${packageName} | grep -E '^ii'`,
      );
      return stdout.trim() === '';
    } catch {
      return true; // Package needs to be installed
    }
  }

  private async checkDockerInstallation(): Promise<boolean> {
    try {
      await this.ssh.executeCommand('docker --version');
      return false; // Docker is already installed
    } catch {
      return true; // Docker needs to be installed
    }
  }

  private async checkUserExists(username: string): Promise<boolean> {
    try {
      await this.ssh.executeCommand(`id -u ${username}`);
      return false; // User exists
    } catch {
      return true; // User needs to be created
    }
  }

  async validateRequirements(): Promise<TaskResult> {
    try {
      await this.validator.validateSystem();
      return {
        changed: false,
        failed: false,
        msg: 'System requirements validated successfully',
      };
    } catch (error) {
      return {
        changed: false,
        failed: true,
        msg: `System requirements validation failed: ${error}`,
      };
    }
  }

  private async clearPackageManagerLocks(): Promise<TaskResult> {
    const commands = [
      'rm -f /var/lib/apt/lists/lock',
      'rm -f /var/cache/apt/archives/lock',
      'rm -f /var/lib/dpkg/lock*',
      'dpkg --configure -a',
    ];

    const description = 'Clear package manager locks';

    try {
      for (const command of commands) {
        await this.ssh.executeCommand(command);
      }
      return {
        changed: true,
        failed: false,
        msg: 'Successfully cleared package manager locks',
      };
    } catch (error) {
      return {
        changed: false,
        failed: true,
        msg: `Failed to clear package manager locks: ${error}`,
      };
    }
  }

  async updateSystem(): Promise<TaskResult[]> {
    console.log('📥 Updating system packages...');

    // Clear locks first
    const clearResult = await this.clearPackageManagerLocks();
    if (clearResult.failed) {
      return [clearResult];
    }

    const tasks = [
      {
        command: 'apt-get update',
        description: 'Update package lists',
      },
      {
        command: 'DEBIAN_FRONTEND=noninteractive apt-get upgrade -y',
        description: 'Upgrade system packages',
      },
    ];

    let step = 1;
    const results: TaskResult[] = [clearResult];
    for (const task of tasks) {
      const result = await this.executeWithRetry(
        task.command,
        task.description,
        step,
        tasks.length,
      );
      results.push(result);
      step++;
      if (result.failed) break;
    }
    return results;
  }

  async installPackages(packages: PackageState[]): Promise<TaskResult[]> {
    console.log('📦 Installing packages...');
    const results: TaskResult[] = [];
    let step = 1;
    for (const pkg of packages) {
      const needsInstall = await this.checkPackage(pkg.name);
      if (!needsInstall && pkg.state !== 'latest') {
        results.push({
          changed: false,
          failed: false,
          msg: `Package ${pkg.name} is already installed`,
        });
        continue;
      }

      const command =
        pkg.state === 'latest'
          ? `apt-get install -y --only-upgrade ${pkg.name}`
          : `apt-get install -y ${pkg.name}`;

      const result = await this.executeWithRetry(
        command,
        `Install package ${pkg.name}`,
        step,
        packages.length,
      );
      results.push(result);
      step++;
      if (result.failed) break;
    }
    return results;
  }

  async setupFirewall(): Promise<TaskResult[]> {
    console.log('🛡️ Setting up firewall...');
    const rules = [
      {
        command: 'ufw default deny incoming',
        description: 'Set default incoming policy',
      },
      {
        command: 'ufw default allow outgoing',
        description: 'Set default outgoing policy',
      },
      { command: 'ufw allow ssh', description: 'Allow SSH' },
      { command: 'ufw allow http', description: 'Allow HTTP' },
      { command: 'ufw allow https', description: 'Allow HTTPS' },
      { command: 'echo "y" | ufw enable', description: 'Enable UFW' },
    ];

    const results: TaskResult[] = [];
    let step = 1;
    for (const rule of rules) {
      const result = await this.executeWithRetry(
        rule.command,
        rule.description,
        step,
        rules.length,
      );
      results.push(result);
      step++;
      if (result.failed) break;
    }
    return results;
  }

  async setupDocker(): Promise<TaskResult[]> {
    console.log('🐳 Installing Docker...');
    const needsInstall = await this.checkDockerInstallation();
    if (!needsInstall) {
      return [
        {
          changed: false,
          failed: false,
          msg: 'Docker is already installed',
        },
      ];
    }

    const tasks = [
      // Clean up any previous failed attempts
      {
        command: 'rm -f get-docker.sh',
        description: 'Clean up previous Docker installation attempts',
      },
      // Install prerequisites
      {
        command:
          'DEBIAN_FRONTEND=noninteractive apt-get install -y ca-certificates curl gnupg',
        description: 'Install Docker prerequisites',
      },
      {
        command: 'curl -fsSL https://get.docker.com -o get-docker.sh',
        description: 'Download Docker installation script',
      },
      {
        command: 'sh get-docker.sh',
        description: 'Install Docker',
      },
      {
        command: 'systemctl enable docker',
        description: 'Enable Docker service',
      },
      {
        command: 'systemctl start docker',
        description: 'Start Docker service',
      },
      // Clean up
      {
        command: 'rm -f get-docker.sh',
        description: 'Clean up Docker installation files',
      },
    ];

    const results: TaskResult[] = [];
    let step = 1;
    for (const task of tasks) {
      const result = await this.executeWithRetry(
        task.command,
        task.description,
        step,
        tasks.length,
      );
      results.push(result);
      step++;
      if (result.failed) break;
    }
    return results;
  }

  async setupUsers(users: User[]): Promise<TaskResult[]> {
    console.log('👥 Setting up users...');
    const results: TaskResult[] = [];

    for (const user of users) {
      const needsSetup = await this.checkUserExists(user.username);
      if (!needsSetup) {
        results.push({
          changed: false,
          failed: false,
          msg: `User ${user.username} already exists`,
        });
        continue;
      }

      const tasks = [
        {
          command: `useradd -m -s /bin/bash ${user.username}`,
          description: `Create user ${user.username}`,
        },
        ...user.groups.map((group) => ({
          command: `usermod -aG ${group} ${user.username}`,
          description: `Add user ${user.username} to group ${group}`,
        })),
        {
          command: `mkdir -p /home/${user.username}/.ssh`,
          description: `Create SSH directory for ${user.username}`,
        },
        {
          command: `chmod 700 /home/${user.username}/.ssh`,
          description: `Set SSH directory permissions for ${user.username}`,
        },
        {
          command: `echo "${user.ssh_keys.join('\n')}" > /home/${user.username}/.ssh/authorized_keys`,
          description: `Add SSH keys for ${user.username}`,
        },
        {
          command: `chmod 600 /home/${user.username}/.ssh/authorized_keys`,
          description: `Set authorized_keys permissions for ${user.username}`,
        },
        {
          command: `chown -R ${user.username}:${user.username} /home/${user.username}/.ssh`,
          description: `Set SSH directory ownership for ${user.username}`,
        },
      ];

      if (user.force_password_change) {
        tasks.push({
          command: `chage -d 0 ${user.username}`,
          description: `Force password change for ${user.username}`,
        });
      }
      let step = 1;
      for (const task of tasks) {
        const result = await this.executeWithRetry(
          task.command,
          task.description,
          step,
          tasks.length,
        );
        results.push(result);
        step++;
        if (result.failed) break;
      }
    }
    return results;
  }

  async setupMonitoring(): Promise<TaskResult[]> {
    console.log('📊 Setting up monitoring...');
    const packages: PackageState[] = [
      { name: 'prometheus-node-exporter', state: 'present' },
    ];

    const results = await this.installPackages(packages);
    if (results.some((r) => r.failed)) return results;

    const services = [
      {
        command: 'systemctl enable prometheus-node-exporter',
        description: 'Enable Prometheus Node Exporter',
      },
      {
        command: 'systemctl start prometheus-node-exporter',
        description: 'Start Prometheus Node Exporter',
      },
    ];

    let step = 1;
    for (const service of services) {
      const result = await this.executeWithRetry(
        service.command,
        service.description,
        step,
        services.length,
      );
      results.push(result);
      step++;
      if (result.failed) break;
    }
    return results;
  }
}
