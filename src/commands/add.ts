import { writeFileSync } from 'fs';
import { join } from 'path';
import { stringify } from 'yaml';
import { Framework, Database, CacheDatabase, ShangoConfig, } from '../types/index.js';
import { parseShangoConfig } from '../util/generate-config.js';
import inquirer from 'inquirer';
import { executeKamal } from '../util/execute-kamal.js';
import { HighLevelConfigParser } from '../lib/high-level-config-parser/index.js';

export async function add(): Promise<void> {
  try {
    const answers = await inquirer.prompt<Omit<ShangoConfig['app'], 'servers'> & { githubUsername: string; appName: string; server: string }>([
      {
        type: 'list',
        name: 'framework',
        message: 'Select your framework:',
        choices: [
          { name: 'Next.js', value: Framework.NEXTJS },
          { name: 'Remix', value: Framework.REMIX },
          { name: 'NuxtJS', value: Framework.NUXTJS },
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
        name: 'githubUsername',
        message: 'Enter your github username:',
      },
      {
        type: 'input',
        name: 'appName',
        message: 'Enter your app name:',
      },
      {
        type: 'input',
        name: 'domain',
        message: 'Enter your domain:',
      },
      {
        type: 'input',
        name: 'server',
        message: 'Enter your ipaddress|domain|subdomain:',
        validate: (input) => {
          const regex = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}$|^(?!:\/\/)(\d{1,3}\.){3}\d{1,3}$/;
          return regex.test(input) || 'Please enter a valid IP address or subdomain';
        }
      },
    ]);


    const config: ShangoConfig = {
      app: {
        appName: answers.appName,
        githubUsername: answers.githubUsername,
        framework: answers.framework,
        domain: answers.domain,
        packageManager: answers.packageManager,
        database: answers.database,
        cacheDatabase: answers.cacheDatabase,
        servers: [answers.server],
      },
    };

    writeFileSync(
      join(process.cwd(), 'shango.yml'),
      stringify(config)
    );

    parseShangoConfig('shango.yml');

    executeKamal('init');


    const parser = new HighLevelConfigParser(config);
    parser.generate();

    console.log('✨ Configuration created successfully!');
    console.log('📁 Configuration file: shango.yml');

  } catch (error) {
    console.error('Error creating configuration:', error);
    process.exit(1);
  }
}
