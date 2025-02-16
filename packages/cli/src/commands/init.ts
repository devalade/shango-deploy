import { writeFileSync } from 'fs';
import { join } from 'path';
import { stringify } from 'yaml';
import {
  Framework,
  DatabaseType,
  CacheType,
  type ShangoConfig,
} from '../types/index.ts';
import inquirer from 'inquirer';
import { executeKamal } from '../util/execute-kamal.ts';
import { TemplateManager } from '../lib/template/index.ts';
import { KamalConfigurationManager } from '../lib/kamal-config/index.ts';

export async function init(): Promise<void> {
  try {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'framework',
        message: 'Select your framework:',
        choices: Object.values(Framework),
      },
      {
        type: 'list',
        name: 'database',
        message: 'Select your primary database:',
        choices: Object.values(DatabaseType),
      },
      {
        type: 'confirm',
        name: 'inMemoryKVDatabase',
        message: 'Do you want to use redis ?',
      },
      {
        type: 'input',
        name: 'githubUsername',
        message: 'Enter your GitHub username:',
        validate: (input) => !!input.trim(),
      },
      {
        type: 'input',
        name: 'appName',
        message: 'Enter your application name:',
        validate: (input) => !!input.trim(),
      },
      {
        type: 'input',
        name: 'domain',
        message: 'Enter your domain:',
        validate: (input) =>
          /^[a-zA-Z0-9][a-zA-Z0-9-_.]+\.[a-zA-Z]{2,}$/.test(input),
      },
      {
        type: 'input',
        name: 'environment',
        message:
          'Enter the available deployment environment seperate by comma:',
        validate: (input) => !!input.trim(),
      },
    ]);

    const config: ShangoConfig = {
      app: {
        name: answers.appName,
        github_username: answers.githubUsername,
        framework: answers.framework,
        domain: answers.domain,
        port: 3000,
      },
      environment: await getEnvironment(answers.environment),
      users: [
        {
          username: 'deploy',
          password: '',
          groups: ['docker', 'sudo'],
          authorized_keys: [{ public_key: '' }],
        },
      ],
      hooks: {
        pre_deploy: [
          {
            command: 'npm run build',
            local: true,
          },
        ],
        post_deploy: [
          {
            command: 'npm run db:migrate',
            remote: true,
          },
        ],
      },
    };

    writeFileSync(join(process.cwd(), 'shango.yml'), stringify(config));

    executeKamal('init');

    const configManager = new KamalConfigurationManager(config, {
      database: answers.database,
      inMemoryKVDatabase: answers.inMemoryKVDatabase,
    });
    await configManager.update();

    process.exit(1);

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

async function getEnvironment(
  environment: string,
): Promise<ShangoConfig['environment']> {
  const environments: ShangoConfig['environment'] = [];

  for (let index: number = 0; index < environment.split(',').length; index++) {
    const name = environment.split(',')[index] as string;
    const environmentAnswers = await inquirer.prompt<{
      servers: string;
      hosts: string;
    }>([
      {
        type: 'input',
        name: 'servers',
        message: `Enter the available servers for the  ${name} seperate by comma:`,
        validate: (input) => !!input.trim(),
      },
      {
        type: 'input',
        name: 'hosts',
        message: `Enter the available hosts for the ${name} seperate by comma:`,
        validate: (input) => !!input.trim(),
      },
    ]);
    environments.push({
      name: name,
      config: `./config/deploy.${environment}.yml`,
      hosts: environmentAnswers.hosts.split(',') as string[],
      servers: environmentAnswers.servers.split(',') as string[],
    });
  }
  return environments;
}
