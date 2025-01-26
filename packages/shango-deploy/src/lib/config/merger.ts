import { type ValidatedShangoConfig } from './validator.ts';
import deepmerge from 'deepmerge';

export class ConfigurationMerger {
  static mergeWithEnvironment(
    baseConfig: ValidatedShangoConfig,
    environment: string
  ): ValidatedShangoConfig {
    const environmentConfig = baseConfig.servers.find(
      server => server.environment === environment
    );

    if (!environmentConfig) {
      throw new Error(`Environment '${environment}' not found in configuration`);
    }

    // Create a new config with environment-specific values
    return deepmerge(baseConfig, {
      servers: [environmentConfig],
      env: {
        clear: {
          NODE_ENV: environment,
          ...baseConfig.env?.clear
        }
      }
    });
  }
}
