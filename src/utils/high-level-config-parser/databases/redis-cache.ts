import { DatabaseConfig } from "../../../types/index.js";

export class RedisCache implements DatabaseConfig {
  private domain: string;

  constructor(domain: string) {
    this.domain = domain;
  }

  getEnvironmentVariables(): Record<string, string> {
    return {
      REDIS_URL: `redis://cache.${this.domain}:6379`
    };
  }

  getAccessoryConfig(): Record<string, any> {
    return {
      redis: {
        image: 'redis:7-alpine',
        host: `cache.${this.domain}`,
        port: 6379,
        directories: ['data:/data']
      }
    };
  }
}

