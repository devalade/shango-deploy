import { readFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'dotenv';
import { Secret, SecretProviderType } from './types.js';

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
