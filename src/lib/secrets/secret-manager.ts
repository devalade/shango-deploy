import { BaseSecretProvider } from './providers/base-provider.js';
import { GithubSecretProvider } from './providers/github-provider.js';
import { Secret, SecretProviderType, SecretError } from './types.js';

export class SecretManager {
  private static instance: SecretManager;
  private providers: Map<SecretProviderType, BaseSecretProvider>;

  private constructor() {
    this.providers = new Map();
  }

  static getInstance(): SecretManager {
    if (!SecretManager.instance) {
      SecretManager.instance = new SecretManager();
    }
    return SecretManager.instance;
  }

  registerProvider(type: SecretProviderType, provider: BaseSecretProvider): void {
    this.providers.set(type, provider);
  }

  async setSecret(secret: Secret): Promise<void> {
    const provider = this.providers.get(secret.provider);
    if (!provider) {
      throw new SecretError(`Provider ${secret.provider} not registered`);
    }

    await provider.setSecret(secret.name, secret.value);
  }

  async getSecret(name: string, provider: SecretProviderType): Promise<string> {
    const secretProvider = this.providers.get(provider);
    if (!secretProvider) {
      throw new SecretError(`Provider ${provider} not registered`);
    }

    return await secretProvider.getSecret(name);
  }

  async syncToGithub(secrets: Secret[]): Promise<void> {
    const githubProvider = this.providers.get(SecretProviderType.GITHUB);
    if (!githubProvider) {
      throw new SecretError('GitHub provider not registered');
    }

    for (const secret of secrets) {
      await githubProvider.setSecret(secret.name, secret.value);
    }
  }
}
