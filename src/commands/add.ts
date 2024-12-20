import inquirer from 'inquirer';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { stringify } from 'yaml';
import { Framework, Database, CacheDatabase } from '../types/index.js';

export async function add(): Promise<void> {
  try {
    const answers = await inquirer.prompt([
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
      }
    ]);

    const config = {
      framework: answers.framework,
      database: answers.database,
      cacheDatabase: answers.cacheDatabase,
      created_at: new Date().toISOString()
    };

    writeFileSync(
      join(process.cwd(), 'shango.yml'),
      stringify(config)
    );

    console.log('✨ Configuration created successfully!');
    console.log('📁 Configuration file: shango.yml');

  } catch (error) {
    console.error('Error creating configuration:', error);
    process.exit(1);
  }
}
