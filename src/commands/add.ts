import { writeFileSync } from 'fs';
import { join } from 'path';
import { stringify } from 'yaml';
import { Framework, Database, CacheDatabase, ShangoConfig, } from '../types/index.js';
import { parseShangoConfig } from '../utils/generate-config.js';
import inquirer, { QuestionCollection } from 'inquirer';

export async function add(): Promise<void> {
  try {
    const answers: Omit<ShangoConfig['app'], 'servers'> & { serverCount: number } = await inquirer.prompt([
      {
        type: 'list',
        name: 'framework',
        message: 'Select your framework:',
        choices: [
          { name: 'Next.js', value: Framework.NEXTJS },
          { name: 'Remix', value: Framework.REMIX },
          { name: 'Svelte', value: Framework.SVELTE },
          { name: 'AdonisJS', value: Framework.ADONISJS },
          { name: 'NestJS', value: Framework.NESTJS }
        ]
      },
      {
        type: 'list',
        name: 'database',
        message: 'Select your database:',
        choices: [
          { name: 'PostgreSQL', value: Database.POSTGRESQL },
          { name: 'MySQL', value: Database.MYSQL },
          { name: 'SQLite', value: Database.SQLITE },
          { name: 'No Database', value: Database.NONE }
        ]
      },
      {
        type: 'list',
        name: 'cacheDatabase',
        message: 'Select your cache database:',
        choices: [
          { name: 'Redis', value: CacheDatabase.REDIS },
          { name: 'Memcached', value: CacheDatabase.MEMCACHED },
          { name: 'No Cache Database', value: CacheDatabase.NONE }
        ]
      },
      {
        type: 'input',
        name: 'domain',
        message: 'Enter your domain:',
      },
      {
        type: 'number',
        name: 'serverCount',
        message: 'How many servers do you have?',
        validate: (input) => input !== undefined && input > 0 || 'You must have at least one server.',
      },
    ]);

    const serverPrompts: QuestionCollection = [];
    for (let i = 0; i < answers.serverCount; i++) {
      serverPrompts.push(
        {
          type: 'input',
          name: `servers[${i}].environment`,
          message: `Enter the environment for server ${i + 1}:`,
        },
        {
          type: 'input',
          name: `servers[${i}].ipAddresses`,
          message: `Enter the IP addresses for server ${i + 1} (comma-separated):`,
          filter: (input) => input.split(',').map((ip) => ip.trim()),
        }
      );
    }

    const serverAnswers = await inquirer.prompt(serverPrompts);

    const servers = Object.keys(serverAnswers).map((key) => serverAnswers[key]);

    const config: ShangoConfig = {
      app: {
        framework: answers.framework,
        domain: answers.domain,
        packageManager: answers.packageManager,
        database: answers.database,
        cacheDatabase: answers.cacheDatabase,
        servers,
      },
    };

    writeFileSync(
      join(process.cwd(), 'shango.yml'),
      stringify(config)
    );

    parseShangoConfig('shango.yml');



    console.log('✨ Configuration created successfully!');
    console.log('📁 Configuration file: shango.yml');

  } catch (error) {
    console.error('Error creating configuration:', error);
    process.exit(1);
  }
}
