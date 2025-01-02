import { DatabaseConfig, FrameworkConfig, ShangoConfig } from "../../types/index.js";
import { KamalYAMLConfigurationGenerator } from "../kamal-generator/index.js";
import { NextJSFramework } from "./frameworks/next-js-framework.js";
import { PostgreSQLDatabase } from "./databases/postgre-sql-database.js";
import { RedisCache } from "./databases/redis-cache.js";

export class HighLevelConfigParser {
  private config: ShangoConfig;
  private generator: KamalYAMLConfigurationGenerator;

  constructor(config: ShangoConfig) {
    this.config = config;
    this.generator = new KamalYAMLConfigurationGenerator();
  }

  private getFrameworkConfig(): FrameworkConfig {
    switch (this.config.app.framework.toLowerCase()) {
      case 'nextjs':
        return new NextJSFramework();
      default:
        throw new Error(`Unsupported framework: ${this.config.app.framework}`);
    }
  }

  private getDatabaseConfig(): DatabaseConfig | null {
    if (!this.config.app.database) return null;

    switch (this.config.app.database.toLowerCase()) {
      case 'postgresql':
        return new PostgreSQLDatabase(this.config.app.domain);
      default:
        return null;
    }
  }

  private getCacheConfig(): DatabaseConfig | null {
    if (!this.config.app.cacheDatabase) return null;

    switch (this.config.app.cacheDatabase.toLowerCase()) {
      case 'redis':
        return new RedisCache(this.config.app.domain);
      default:
        return null;
    }
  }

  generate(): Record<string, any> {
    const framework = this.getFrameworkConfig();
    const database = this.getDatabaseConfig();
    const cache = this.getCacheConfig();

    this.generator.addSection('basic', {
      serviceName: this.config.app.appName,
      imageName: `${this.config.app.githubUsername}/${this.config.app.appName}`,
    });

    this.generator.addSection('builder', {
      arch: 'amd64'
    });

    if (Array.isArray(this.config.app.servers)) {
      this.generator.addSection('servers', {
        web: this.config.app.servers
      });
    }

    this.generator.addSection('proxy', {
      ssl: true,
      host: this.config.app.domain,
      appPort: framework.getAppPort()
    });

    this.generator.addSection('registry', {
      server: 'ghcr.io',
      username: this.config.app.githubUsername,
      passwordSecrets: ['GITHUB_TOKEN']
    });

    const envVars: Record<string, string> = {
      ...framework.getEnvironmentVariables(),
      ...(database?.getEnvironmentVariables() || {}),
      ...(cache?.getEnvironmentVariables() || {})
    };

    this.generator.addSection('env', {
      clear: envVars
    });

    const accessories = {
      ...(database?.getAccessoryConfig() || {}),
      ...(cache?.getAccessoryConfig() || {}),
      ...framework.getAccessories()
    };

    if (Object.keys(accessories).length > 0) {
      this.generator.addSection('accessories', accessories);
    }

    if (this.getFrameworkConfig().getAssetPath()) {
      this.generator.addSection('assets', this.getFrameworkConfig().getAssetPath());
    }

    return this.generator.generate();
  }
}
