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
    if (!this.config.databases.primary) return null;

    switch (this.config.databases.primary.type.toLowerCase()) {
      case 'postgresql':
        return new PostgreSQLDatabase(this.config.app.domain);
      default:
        return null;
    }
  }

  private getCacheConfig(): DatabaseConfig | null {
    if (!this.config.databases.cache) return null;

    switch (this.config.databases.cache.type.toLowerCase()) {
      case 'redis':
        return new RedisCache(this.config.app.domain);
      default:
        return null;
    }
  }

  private addDeploymentConfig(): void {
    const { deployment } = this.config;

    this.generator.addSection('boot', {
      limit: deployment.max_parallel,
      wait: deployment.delay
    });

    this.generator.addSection('healthcheck', {
      path: deployment.healthcheck.path,
      port: deployment.healthcheck.port,
      interval: deployment.healthcheck.interval,
      timeout: deployment.healthcheck.timeout,
      retries: deployment.healthcheck.retries
    });
  }

  generate(): Record<string, any> {
    const framework = this.getFrameworkConfig();
    const database = this.getDatabaseConfig();
    const cache = this.getCacheConfig();

    this.generator.addSection('basic', {
      serviceName: this.config.app.name,
      imageName: `${this.config.app.github_username}/${this.config.app.name}`,
    });

    this.generator.addSection('builder', {
      arch: 'amd64'
    });

    // FIXME: update the logic of the parser to handle the new format of the servers config
    if (Array.isArray(this.config.servers)) {
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
      username: this.config.app.github_username,
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
