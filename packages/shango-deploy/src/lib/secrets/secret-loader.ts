import { readFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'dotenv';
import { type Secret, SecretProviderType } from './types.ts';

export class SecretLoader {
  static loadFromKamalSecrets(): Secret[] {
    const secretsPath = join(process.cwd(), '.kamal', 'secrets');
    const content = readFileSync(secretsPath, 'utf8');
    const parsed = parse(content);

    return Object.entries(parsed).map(([name, value]) => ({
      name,
      value,
      provider: SecretProviderType.ENV
    }));
  }
}
