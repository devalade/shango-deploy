import { executeKamal } from '../util/execute-kamal.ts';

export async function kamal(cmd: string[]): Promise<void> {
  console.log('Kamal command is running');
  executeKamal(cmd);

  if (cmd.includes('setup')) {
    // TODO: implement setup logic
  }
}
