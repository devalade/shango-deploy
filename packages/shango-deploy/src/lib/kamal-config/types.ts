export interface KamalConfig {
  service: string;
  image: string;
  registry: {
    server: string;
    username: string;
    password: string[];
  };
  servers: Record<string, string[]>;
  env?: {
    clear?: Record<string, string>;
    secret?: string[];
  };
  accessories?: Record<string, any>;
  healthcheck?: {
    path: string;
    port: number;
    interval: number;
    timeout: number;
    retries: number;
  };
  rolling_deploy?: {
    max_parallel: number;
    delay: number;
  };
  hooks?: {
    pre_deploy?: string[];
    post_deploy?: string[];
  };
}

export class KamalConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'KamalConfigurationError';
  }
}
