import { SecretManager } from '../lib/secrets/secret-manager.js';
import { SecretLoader } from '../lib/secrets/secret-loader.js';
import { GithubSecretProvider } from '../lib/secrets/providers/github-provider.js';
import { SecretProviderType } from '../lib/secrets/types.js';

export async function syncSecrets(options: { owner: string, repo: string, token: string }): Promise<void> {
  try {
    const secretManager = SecretManager.getInstance();

    secretManager.registerProvider(
      SecretProviderType.GITHUB,
      new GithubSecretProvider({
        owner: options.owner,
        repo: options.repo,
        token: options.token
      })
    );

    const secrets = SecretLoader.loadFromKamalSecrets();

    await secretManager.syncToGithub(secrets);

    console.log('✨ Secrets synchronized to GitHub successfully!');
  } catch (error) {
    console.error('Error synchronizing secrets:', error);
    process.exit(1);
  }
}
