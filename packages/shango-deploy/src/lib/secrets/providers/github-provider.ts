import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';
import sodium from 'libsodium-wrappers';
import { BaseSecretProvider } from './base-provider.ts';
import { type GithubSecretConfig, SecretError } from '../types.ts';

export class GithubSecretProvider extends BaseSecretProvider {
  private octokit: Octokit;
  private owner: string;
  private repo: string;

  constructor(config: GithubSecretConfig) {
    super(config);
    this.owner = config.owner;
    this.repo = config.repo;
    this.octokit = new Octokit({
      auth: config.token
    });
  }

  getName(): string {
    return 'GitHub';
  }

  async getSecret(name: string): Promise<string> {
    try {
      // Note: GitHub doesn't provide API to get secret values
      throw new SecretError('Cannot retrieve secret values from GitHub');
    } catch (error) {
      this.handleError(error, 'get');
    }
  }

  async setSecret(name: string, value: string): Promise<void> {
    try {
      // Get the public key for the repository
      const { data: publicKey } = await this.octokit.actions.getRepoPublicKey({
        owner: this.owner,
        repo: this.repo
      });

      // Convert the secret value to an encrypted value using the public key
      await sodium.ready;
      const binKey = sodium.from_base64(publicKey.key, sodium.base64_variants.ORIGINAL);
      const binValue = sodium.from_string(value);
      const encBytes = sodium.crypto_box_seal(binValue, binKey);
      const encrypted_value = sodium.to_base64(encBytes, sodium.base64_variants.ORIGINAL);

      // Create or update the secret
      await this.octokit.actions.createOrUpdateRepoSecret({
        owner: this.owner,
        repo: this.repo,
        secret_name: name,
        encrypted_value,
        key_id: publicKey.key_id
      });
    } catch (error) {
      this.handleError(error, 'set');
    }
  }

  async listSecrets(): Promise<string[]> {
    try {
      const { data } = await this.octokit.actions.listRepoSecrets({
        owner: this.owner,
        repo: this.repo
      });

      return data.secrets.map(secret => secret.name);
    } catch (error) {
      this.handleError(error, 'list');
    }
  }
}
