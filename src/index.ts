#!/usr/bin/env node

import { Command } from 'commander';
import { add } from './commands/add.js';

const program = new Command();

program
  .name('shango')
  .description('Deploy your web app anywhere')
  .version('0.0.1');

program
  .command('add')
  .description('Configure your application stack')
  .action(add);

program.parse();
