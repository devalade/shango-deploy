import { DatabaseConfig } from "../../../types/index.js";

export class PostgreSQLDatabase implements DatabaseConfig {
  private domain: string;

  constructor(domain: string) {
    this.domain = domain;
  }

  getEnvironmentVariables(): Record<string, string> {
    return {
      DATABASE_URL: `postgresql://postgres@db.${this.domain}/postgres`
    };
  }

  getAccessoryConfig(): Record<string, any> {
    return {
      db: {
        image: 'postgres:15-alpine',
        host: `db.${this.domain}`,
        port: 5432,
        env: {
          clear: {
            POSTGRES_HOST_AUTH_METHOD: 'trust'
          }
        },
        directories: ['data:/var/lib/postgresql/data']
      }
    };
  }
}

