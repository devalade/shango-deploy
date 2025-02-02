export enum SecretProviderType {
  ENV = 'env',
  FILE = 'file',
  ONEPASSWORD = '1password',
  LASTPASS = 'lastpass',
  GITHUB = 'github'
}

export interface Secret {
  name: string;
  value: string;
  provider: SecretProviderType;
}

export interface SecretProviderConfig {
  type: SecretProviderType;
  config?: Record<string, any>;
}

export interface GithubSecretConfig {
  owner: string;
  repo: string;
  token: string;
}

export class SecretError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SecretError';
  }
}
