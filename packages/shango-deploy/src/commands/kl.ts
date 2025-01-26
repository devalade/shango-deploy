import inquirer from 'inquirer';
import { executeKamal } from '../util/execute-kamal.ts';

export async function kamal(cmd: string[]): Promise<void> {
  console.log('Kamal command is running');
  console.log('Command:', cmd);
  executeKamal(cmd);
  if (cmd.includes('setup')) {
    // TODO: implement setup logic
  }
}
