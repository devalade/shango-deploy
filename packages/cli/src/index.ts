#!/usr/bin/env node

import { Command } from 'commander';
import { add } from './commands/init.ts';
import { kamal } from './commands/kl.ts';
import { provision } from './commands/provision.ts';
import { syncSecrets } from './commands/sync-secrets.ts';

const program = new Command();

program
  .name('shango')
  .description('Deploy your web app anywhere')
  .version('0.0.1');

program
  .command('provision')
  .description('Provision servers with required configurations')
  .option(
    '-e, --environment <value>',
    'Target environment (staging/production)',
    'production',
  )
  .option('-i <path>', 'identity file or private key')
  .option('-u, --user <value>', 'The username of your host machine', 'root')
  .option(
    '-p, --port <number>',
    'The port to SSH into to the server',
    parseInt,
    22,
  )
  .action(provision);

program
  .command('add')
  .description('Generate a new Shango configuration')
  .action(add);

program
  .command('kl')
  .argument('[cmd...]')
  .description('This is an alias to the kamal deploy')
  .action(kamal);

program
  .command('sync-secrets')
  .description('Synchronize secrets to GitHub')
  .requiredOption('--owner <owner>', 'GitHub repository owner')
  .requiredOption('--repo <repo>', 'GitHub repository name')
  .requiredOption('--token <token>', 'GitHub personal access token')
  .action(syncSecrets);

program.parse();
