import { type Secret, SecretError } from '../types.ts';

export abstract class BaseSecretProvider {
  constructor(protected config: Record<string, any> = {}) { }

  abstract getName(): string;
  abstract getSecret(name: string): Promise<string>;
  abstract setSecret(name: string, value: string): Promise<void>;
  abstract listSecrets(): Promise<string[]>;

  protected handleError(error: any, operation: string): never {
    throw new SecretError(
      `Failed to ${operation} secret from ${this.getName()}: ${error.message}`
    );
  }
}
