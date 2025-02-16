import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'fs';
import { join } from 'path';
import { parse as parseYAML, stringify } from 'yaml';
import { type ValidatedShangoConfig } from '../config/validator.ts';
import { type KamalConfig, KamalConfigurationError } from './types.ts';
import { mergeConfigurations } from './merger.ts';
import { KamalConfigSchema } from './validator.ts';
import { DatabaseType } from '../../types/index.ts';

interface otherConfig {
  database: DatabaseType;
  inMemoryKVDatabase: boolean;
}

export class KamalConfigurationManager {
  private config: ValidatedShangoConfig;
  private kamalConfigPath: string;
  private envConfig: ValidatedShangoConfig['environment'][number];
  private otherConfig: otherConfig;

  constructor(config: ValidatedShangoConfig, otherConfig: otherConfig) {
    this.config = config;
    this.otherConfig = otherConfig;
    this.kamalConfigPath = join(
      process.cwd(),
      this.config.environment[0].config,
    );
    this.envConfig = this.config.environment[0];
  }

  async update(): Promise<void> {
    try {
      for (let index = 0; index < this.config.environment.length; index++) {
        this.kamalConfigPath = join(
          process.cwd(),
          this.config.environment[index].config,
        );
        console.log({ envPath: this.kamalConfigPath });

        this.prepareEnvironmentYamlFile(this.kamalConfigPath);

        this.envConfig = this.config.environment[0];
        await this.waitForKamalConfig();

        const existingConfig = this.readKamalConfig();

        const updatedConfig = this.generateUpdatedConfig(existingConfig);

        this.writeKamalConfig(updatedConfig);
      }
    } catch (error) {
      throw new KamalConfigurationError(
        `Failed to update  deployment configuration: ${error}`,
      );
    }
  }

  private async waitForKamalConfig(timeout: number = 5000): Promise<void> {
    const startTime = Date.now();
    while (!existsSync(this.kamalConfigPath)) {
      if (Date.now() - startTime > timeout) {
        throw new KamalConfigurationError(
          `Timeout waiting for ${this.kamalConfigPath} to be generated`,
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  private readKamalConfig(): KamalConfig {
    try {
      const content = readFileSync(this.kamalConfigPath, 'utf8');
      const config = parseYAML(content);
      return KamalConfigSchema.parse(config);
    } catch (error) {
      throw new KamalConfigurationError(`Failed to read kamal.yml: ${error}`);
    }
  }

  private generateUpdatedConfig(existingConfig: KamalConfig): KamalConfig {
    return mergeConfigurations(existingConfig, this.generateConfigFromShango());
  }

  private generateConfigFromShango(): Partial<KamalConfig> {
    return {
      service: this.config.app.name,
      image: `ghcr.io/${this.config.app.github_username}/${this.config.app.name}`,
      registry: {
        server: 'ghcr.io',
        username: this.config.app.github_username,
        password: ['GITHUB_TOKEN'],
      },
      servers: this.generateServersConfig(),
      proxy: this.generateProxyConfig(),
      env: this.generateEnvConfig(),
      accessories: this.generateAccessoriesConfig(),
    };
  }

  private generateServersConfig(): KamalConfig['servers'] {
    const servers: KamalConfig['servers'] = {
      web: Array.isArray(this.envConfig.servers)
        ? this.envConfig.servers
        : [this.envConfig.servers],
    };

    return servers;
  }

  private generateProxyConfig(): KamalConfig['proxy'] {
    const proxy: KamalConfig['proxy'] = {
      app_port: this.config.app.port,
      ssl: true,
      healthcheck: {
        interval: 3,
        path: '/up',
        timeout: 3,
      },
    };

    return Array.isArray(this.envConfig.hosts)
      ? { ...proxy, hosts: this.envConfig.hosts }
      : { ...proxy, host: this.envConfig.hosts };
  }

  private generateEnvConfig() {
    return {
      clear: {
        NODE_ENV: 'production',
      },
      secret: [],
    };
  }

  private generateAccessoriesConfig() {
    const accessories: Record<string, any> = {};

    if (true) {
      accessories.db = this.generateDatabaseConfig();
    }

    if (true) {
      accessories.cache = this.generateCacheConfig();
    }

    return accessories;
  }

  private generateDatabaseConfig() {
    if (this.otherConfig.database === DatabaseType.POSTGRESQL) {
      return this.getPostgreSQLConfig();
    } else if (this.otherConfig.database === DatabaseType.MYSQL) {
      return this.getMysqlConfig();
    }
    return {};
  }

  private getPostgreSQLConfig() {
    return {
      image: 'postgres:15',
      host: '192.168.0.2',
      port: 5432,
      env: {
        clear: {
          POSTGRES_DB: 'mydatabase',
          POSTGRES_USER: 'postgres',
          POSTGRES_HOST_AUTH_METHOD: 'trust',
        },
        secret: ['POSTGRES_PASSWORD'],
      },
      files: [
        'config/postgres/postgresql.conf:/etc/postgresql/postgresql.conf',
        'config/postgres/pg_hba.conf:/etc/postgresql/pg_hba.conf',
        'db/init.sql:/docker-entrypoint-initdb.d/init.sql',
      ],
      directories: ['data:/var/lib/postgresql/data'],
    };
  }
  private getMysqlConfig() {
    return {
      image: 'mysql:8.0',
      host: '192.168.0.2',
      port: 3306,
      env: {
        clear: {
          MYSQL_ROOT_HOST: '%',
        },
        secret: ['MYSQL_ROOT_PASSWORD'],
      },
      files: [
        'config/mysql/production.cnf:/etc/mysql/my.cnf',
        'db/production.sql:/docker-entrypoint-initdb.d/setup.sql',
      ],
      directories: ['data:/var/lib/mysql'],
    };
  }

  private generateCacheConfig() {
    if (this.otherConfig.inMemoryKVDatabase) {
      return {
        image: 'valkey/valkey:8',
        host: this.envConfig.servers[0],
        port: 6379,
        volumes: ['data:/data'],
      };
    }
    return {};
  }

  private writeKamalConfig(config: KamalConfig): void {
    console.log('writeKamalConfig', { path: this.kamalConfigPath });
    try {
      writeFileSync(this.kamalConfigPath, stringify(config));
    } catch (error) {
      throw new KamalConfigurationError(
        `Failed to write ${this.kamalConfigPath}: ${error}`,
      );
    }
  }

  private prepareEnvironmentYamlFile(path: string) {
    if (existsSync(path)) return;
    const defaultConfig = 'config/deploy.yml';
    if (!existsSync(path)) {
      console.log('prepareEnvironmentYamlFile', { path: this.kamalConfigPath });
      copyFileSync(defaultConfig, this.kamalConfigPath);
    } else {
      throw new KamalConfigurationError(
        `Failed to generate ${this.kamalConfigPath}`,
      );
    }
  }
}
