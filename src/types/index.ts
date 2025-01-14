export enum Framework {
  NEXTJS = 'nextjs',
  REMIX = 'remix',
  NUXTJS = 'nuxjs',
  SVELTE = 'svelte',
  ADONISJS = 'adonisjs',
  NESTJS = 'nestjs'
}

export enum Database {
  POSTGRESQL = 'postgresql',
  MYSQL = 'mysql',
  SQLITE = 'sqlite',
  NONE = 'none'
}

export enum CacheDatabase {
  REDIS = 'redis',
  MEMCACHED = 'memcached',
  NONE = 'none'
}

export enum PackageManager {
  REDIS = 'redis',
  MEMCACHED = 'memcached',
  NONE = 'none'
}


interface AppConfig {
  appName: string;
  githubUsername: string;
  framework: Framework;
  domain: string;
  packageManager: PackageManager;
  database: string;
  cacheDatabase: string;
  servers: string[];
  assetPath?: string;
}


export interface FrameworkConfig {
  getAssetPath(): string;
  getEnvironmentVariables(): Record<string, string>;
  getAccessories(): Record<string, any>;
  getAppPort(): number;
  displayAditionalInstructions(): void;
}

export interface DatabaseConfig {
  getEnvironmentVariables(): Record<string, string>;
  getAccessoryConfig(): Record<string, any>;
}


export interface Hook {
  command: string;
  local?: boolean;
  remote?: boolean;
}

export interface Hooks {
  pre_deploy?: Hook[];
  post_deploy?: Hook[];
  pre_provision?: Hook[];
  post_provision?: Hook[];
}

export interface User {
  username: string;
  groups: string[];
  create_home: boolean;
  force_password_change: boolean;
  ssh_keys: string[];
}

export interface ShangoConfig {
  app: {
    name: string;
    github_username: string;
    framework: Framework;
    domain: string;
    package_manager: PackageManager;
  };
  databases: {
    primary?: {
      type: string;
      version: string;
    };
    cache?: {
      type: string;
      version: string;
    };
  };
  servers: Array<{
    environment: string;
    hosts: string[];
  }>;
  users: User[];
  hooks: Hooks;
  deployment: {
    strategy: 'rolling' | 'all-at-once';
    max_parallel: number;
    delay: number;
    healthcheck: {
      path: string;
      port: number;
      interval: number;
      timeout: number;
      retries: number;
    };
  };
}
