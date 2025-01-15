
export enum Framework {
  NEXTJS = 'nextjs',
  REMIX = 'remix',
  NUXTJS = 'nuxtjs',
  SVELTE = 'svelte',
  ADONISJS = 'adonisjs',
  NESTJS = 'nestjs'
}

export enum DatabaseType {
  POSTGRESQL = 'postgresql',
  MYSQL = 'mysql',
  SQLITE = 'sqlite',
  NONE = 'none'
}

export enum CacheType {
  REDIS = 'redis',
  MEMCACHED = 'memcached',
  NONE = 'none'
}

export enum PackageManager {
  NPM = 'npm',
  YARN = 'yarn',
  PNPM = 'pnpm'
}

export interface DatabaseConfig {
  type: DatabaseType;
  version: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
}

export interface ServerConfig {
  environment: string;
  hosts: string[];
  roles?: string[];
}

export interface HealthcheckConfig {
  path: string;
  port: number;
  interval: number;
  timeout: number;
  retries: number;
}

export interface DeploymentConfig {
  strategy: 'rolling' | 'all-at-once';
  max_parallel: number;
  delay: number;
  healthcheck: HealthcheckConfig;
}

export interface Hook {
  command: string;
  local?: boolean;
  remote?: boolean;
  condition?: string;
  timeout?: number;
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
    port?: number;
  };
  databases: {
    primary?: DatabaseConfig;
    cache?: DatabaseConfig;
  };
  servers: ServerConfig[];
  deployment: DeploymentConfig;
  users: User[];
  hooks: Hooks;
  volumes?: {
    name: string;
    path: string;
  }[];
  env?: {
    clear?: Record<string, string>;
    secret?: string[];
  };
}

export interface TemplateOptions {
  framework: Framework;
  dockerfile: boolean;
  githubAction: boolean;
  templateDir: string;
  appName: string;
  githubUsername: string;
}
