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

export interface ShangoConfig {
  framework: Framework;
  database: Database;
  cacheDatabase: CacheDatabase;
  created_at: string;
}
