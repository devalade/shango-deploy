import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { parse as parseYAML, stringify } from 'yaml';
import { type ValidatedShangoConfig } from '../config/validator.ts';
import { type KamalConfig, KamalConfigurationError } from './types.ts';
import { validateKamalConfig } from './validator.ts';
import { mergeConfigurations } from './merger.ts';

export class KamalConfigurationManager {
  private config: ValidatedShangoConfig;
  private kamalConfigPath: string;

  constructor(config: ValidatedShangoConfig) {
    this.config = config;
    this.kamalConfigPath = join(process.cwd(), '.config', 'kamal.yml');
  }

  async update(): Promise<void> {
    try {
      // Wait for kamal.yml to be generated
      await this.waitForKamalConfig();

      // Read existing kamal.yml
      const existingConfig = this.readKamalConfig();

      // Merge with our configuration
      const updatedConfig = this.generateUpdatedConfig(existingConfig);

      // Write back the updated configuration
      this.writeKamalConfig(updatedConfig);

    } catch (error) {
      throw new KamalConfigurationError(`Failed to update Kamal configuration: ${error}`);
    }
  }

  private async waitForKamalConfig(timeout: number = 5000): Promise<void> {
    const startTime = Date.now();
    while (!existsSync(this.kamalConfigPath)) {
      if (Date.now() - startTime > timeout) {
        throw new KamalConfigurationError('Timeout waiting for kamal.yml to be generated');
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  private readKamalConfig(): KamalConfig {
    try {
      const content = readFileSync(this.kamalConfigPath, 'utf8');
      const config = parseYAML(content);
      return validateKamalConfig(config);
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
        password: ['GITHUB_TOKEN']
      },
      servers: this.generateServersConfig(),
      env: this.generateEnvConfig(),
      accessories: this.generateAccessoriesConfig(),
      healthcheck: this.config.deployment.healthcheck,
      rolling_deploy: {
        max_parallel: this.config.deployment.max_parallel,
        delay: this.config.deployment.delay
      }
    };
  }

  private generateServersConfig(): Record<string, string[]> {
    const servers: Record<string, string[]> = {};

    this.config.servers.forEach(serverConfig => {
      servers[serverConfig.environment] = serverConfig.hosts;
    });

    return servers;
  }

  private generateEnvConfig() {
    return {
      clear: {
        NODE_ENV: 'production',
        ...this.config.env?.clear
      },
      secret: this.config.env?.secret || []
    };
  }

  private generateAccessoriesConfig() {
    const accessories: Record<string, any> = {};

    if (this.config.databases.primary) {
      accessories.db = this.generateDatabaseConfig(this.config.databases.primary);
    }

    if (this.config.databases.cache) {
      accessories.cache = this.generateCacheConfig(this.config.databases.cache);
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
          POSTGRES_HOST_AUTH_METHOD: 'trust'
        }
      },
      volumes: ['data:/var/lib/postgresql/data']
    };
  }

  private generateCacheConfig(cacheConfig: any) {
    return {
      image: `${cacheConfig.type}:${cacheConfig.version}-alpine`,
      host: `cache.${this.config.app.domain}`,
      port: cacheConfig.port || 6379,
      volumes: ['data:/data']
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
