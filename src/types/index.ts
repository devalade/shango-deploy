export enum Framework {
  NEXTJS = 'nextjs',
  REMIX = 'remix',
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
  framework: Framework;
  domain: string;
  packageManager: PackageManager;
  database: string;
  cacheDatabase: string;
  servers: string[];
}


export interface ShangoConfig {
  app: AppConfig;
}

export interface FrameworkConfig {
  getEnvironmentVariables(): Record<string, string>;
  getAccessories(): Record<string, any>;
  getAppPort(): number;
}

export interface DatabaseConfig {
  getEnvironmentVariables(): Record<string, string>;
  getAccessoryConfig(): Record<string, any>;
}
