import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { parse as parseYAML, stringify } from 'yaml';
import { type ValidatedShangoConfig } from '../config/validator.ts';
import { type KamalConfig, KamalConfigurationError } from './types.ts';
import { mergeConfigurations } from './merger.ts';
import { KamalConfigSchema } from './validator.ts';

export class KamalConfigurationManager {
  private config: ValidatedShangoConfig;
  private kamalConfigPath: string;
  public envConfig: ValidatedShangoConfig['environment'][number];

  constructor(config: ValidatedShangoConfig) {
    this.config = config;
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

        this.envConfig = this.config.environment[0];
        await this.waitForKamalConfig();

        const existingConfig = this.readKamalConfig();

        const updatedConfig = this.generateUpdatedConfig(existingConfig);

        this.writeKamalConfig(updatedConfig);
      }
    } catch (error) {
      throw new KamalConfigurationError(
        `Failed to update Kamal configuration: ${error}`,
      );
    }
  }

  private async waitForKamalConfig(timeout: number = 5000): Promise<void> {
    const startTime = Date.now();
    while (!existsSync(this.kamalConfigPath)) {
      if (Date.now() - startTime > timeout) {
        throw new KamalConfigurationError(
          'Timeout waiting for kamal.yml to be generated',
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
      accessories.db = this.generateDatabaseConfig('postgres');
    }

    if (true) {
      accessories.cache = this.generateCacheConfig('redis');
    }

    return accessories;
  }

  private generateDatabaseConfig(dbConfig: any) {
    return {
      image: `${dbConfig.type}:${dbConfig.version}-alpine`,
      host: `db.${this.config.app.domain}`,
      port: dbConfig.port || 5432,
      env: {
        clear: {
          POSTGRES_DB: this.config.app.name.replace(/-/g, '_'),
          POSTGRES_HOST_AUTH_METHOD: 'trust',
        },
      },
      volumes: ['data:/var/lib/postgresql/data'],
    };
  }

  private generateCacheConfig(cacheConfig: any) {
    return {
      image: `${cacheConfig.type}:${cacheConfig.version}-alpine`,
      host: `cache.${this.config.app.domain}`,
      port: cacheConfig.port || 6379,
      volumes: ['data:/data'],
    };
  }

  private writeKamalConfig(config: KamalConfig): void {
    try {
      writeFileSync(this.kamalConfigPath, stringify(config));
    } catch (error) {
      throw new KamalConfigurationError(`Failed to write kamal.yml: ${error}`);
    }
  }
}
