import { SecretManager } from '../lib/secrets/secret-manager.ts';
import { SecretLoader } from '../lib/secrets/secret-loader.ts';
import { GithubSecretProvider } from '../lib/secrets/providers/github-provider.ts';
import { SecretProviderType } from '../lib/secrets/types.ts';

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
