import { writeFileSync } from 'fs';
import { join } from 'path';
import { stringify } from 'yaml';
import { Framework, DatabaseType, CacheType, ShangoConfig, PackageManager } from '../types/index.js';
import inquirer from 'inquirer';
import { executeKamal } from '../util/execute-kamal.js';
import { TemplateManager } from '../lib/template/index.js';
import { KamalConfigurationManager } from 'src/lib/kamal-config/index.js';

export async function add(): Promise<void> {
  try {
    // Step 1: Gather information through interactive prompts
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'framework',
        message: 'Select your framework:',
        choices: Object.values(Framework)
      },
      {
        type: 'list',
        name: 'database',
        message: 'Select your primary database:',
        choices: Object.values(DatabaseType)
      },
      {
        type: 'list',
        name: 'cache',
        message: 'Select your cache database:',
        choices: Object.values(CacheType)
      },
      {
        type: 'input',
        name: 'githubUsername',
        message: 'Enter your GitHub username:',
        validate: (input) => !!input.trim()
      },
      {
        type: 'input',
        name: 'appName',
        message: 'Enter your application name:',
        validate: (input) => !!input.trim()
      },
      {
        type: 'input',
        name: 'domain',
        message: 'Enter your domain:',
        validate: (input) => /^[a-zA-Z0-9][a-zA-Z0-9-_.]+\.[a-zA-Z]{2,}$/.test(input)
      },
      {
        type: 'input',
        name: 'stagingServers',
        message: 'Enter staging server IPs/hosts (comma-separated):',
        filter: (input: string) => input.split(',').map(s => s.trim()).filter(Boolean)
      },
      {
        type: 'input',
        name: 'productionServers',
        message: 'Enter production server IPs/hosts (comma-separated):',
        filter: (input: string) => input.split(',').map(s => s.trim()).filter(Boolean)
      }
    ]);

    // Step 2: Create ShangoConfig object
    const config: ShangoConfig = {
      app: {
        name: answers.appName,
        github_username: answers.githubUsername,
        framework: answers.framework,
        domain: answers.domain,
        package_manager: PackageManager.NPM,
      },
      databases: {
        primary: answers.database !== DatabaseType.NONE ? {
          type: answers.database,
          version: getDatabaseVersion(answers.database),
        } : undefined,
        cache: answers.cache !== CacheType.NONE ? {
          type: answers.cache,
          version: getCacheVersion(answers.cache),
        } : undefined,
      },
      servers: [
        {
          environment: 'staging',
          hosts: answers.stagingServers,
        },
        {
          environment: 'production',
          hosts: answers.productionServers,
        }
      ],
      deployment: {
        strategy: 'rolling',
        max_parallel: 2,
        delay: 5,
        healthcheck: {
          path: '/health',
          port: 3000,
          interval: 10,
          timeout: 2,
          retries: 3
        }
      },
      users: [
        {
          username: 'deploy',
          groups: ['docker', 'sudo'],
          create_home: true,
          force_password_change: true,
          ssh_keys: [] // Should be populated from system or user input
        }
      ],
      hooks: {
        pre_deploy: [
          {
            command: 'npm run build',
            local: true
          }
        ],
        post_deploy: [
          {
            command: 'npm run db:migrate',
            remote: true
          }
        ]
      }
    };

    // Step 3: Write shango.yml
    writeFileSync(
      join(process.cwd(), 'shango.yml'),
      stringify(config)
    );

    // Step 4: Initialize Kamal
    executeKamal('init');

    // Step 5: Generate Kamal configurations
    const configManager = new KamalConfigurationManager(config);
    await configManager.update();

    // Step 6: Generate templates
    const templateManager = new TemplateManager({
      framework: answers.framework,
      dockerfile: true,
      githubAction: true,
      templateDir: process.env.SHANGO_TEMPLATE || './.shango-templates',
      appName: answers.appName,
      githubUsername: answers.githubUsername,
    });
    await templateManager.generate();

    console.log('✨ Project configuration completed successfully!');
    console.log('📁 Configuration files generated:');
    console.log('  - shango.yml');
    console.log('  - .config/deploy.staging.yml');
    console.log('  - .config/deploy.production.yml');
    console.log('  - Dockerfile');
    console.log('  - .github/workflows/deploy.yml');

  } catch (error) {
    console.error('Error creating configuration:', error);
    process.exit(1);
  }
}

function getDatabaseVersion(type: DatabaseType): string {
  switch (type) {
    case DatabaseType.POSTGRESQL: return '14';
    case DatabaseType.MYSQL: return '8.0';
    case DatabaseType.SQLITE: return '3';
    default: return '';
  }
}

function getCacheVersion(type: CacheType): string {
  switch (type) {
    case CacheType.REDIS: return '7';
    case CacheType.MEMCACHED: return '1.6';
    default: return '';
  }
}
