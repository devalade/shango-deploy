export interface KamalConfig {
  service: string;
  image: string;
  servers: {
    web: string[];
    job?: {
      hosts: string[];
      cmd: string;
    };
    cron?: {
      hosts: string[];
      cmd: string;
    };
  };
  proxy?: {
    ssl: boolean;
    host?: string;
    hosts?: string[];
    app_port?: number;
    forward_headers?: boolean;
    response_timeout?: number;
    healthcheck: {
      interval: number;
      path: string;
      timeout: number;
    };
    buffering?: {
      requests: boolean;
      responses: boolean;
      max_request_body: number;
      max_response_body: number;
      memory: number;
    };
    logging?: {
      request_headers: string[];
      response_headers: string[];
    };
  };
  registry: {
    server?: string;
    username: string;
    password: string | string[];
  };
  builder: {
    ssh?: string;
    driver: string;
    arch: 'amd64' | 'arm64' | ('amd64' | 'arm64')[];
    remote?: string;
    local?: boolean;
    context?: string;
    dockerfile?: string;
    target?: string;
    provenance?: string;
    sbom: boolean;
    cache?: {
      type: 'gha' | 'registry';
      options: string;
      image: string;
    };
    args?: Record<string, string>;
    secrets?: Record<string, string>;
  };
  env?: {
    clear?: Record<string, string>;
    secret?: string[];
  };
  aliases?: Record<string, string>;
  ssh?: {
    user?: string;
    port?: string;
    proxy?: string;
    log_level?: string;
    keys_only?: boolean;
    keys?: string[];
    key_data?: string[];
    config?: boolean;
  };
  sshkit?: {
    max_concurrent_starts: number;
    pool_idle_timeout: number;
  };
  volumes?: string[];
  asset_path?: string;
  boot?: {
    limit: number | string;
    wait: number;
  };
  accessories?: {
    [key: string]: AccessoryService;
  };
  loging?: {
    driver?: string;
    options: {
      'max-size': string;
    };
  };
}

interface EnvConfig {
  clear?: Record<string, string>;
  secret?: string[];
}

interface AccessoryService {
  image: string;
  host: string;
  port: number;
  env?: EnvConfig;
  files?: string[];
  directories?: string[];
}

export class KamalConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'KamalConfigurationError';
  }
}
