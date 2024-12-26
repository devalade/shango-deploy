export interface BasicConfigOptions {
  serviceName?: string;
  imageName?: string;
}

export interface ServerConfig {
  [key: string]: string[];
}

export interface ProxyConfigOptions {
  ssl?: boolean;
  host?: string;
  appPort?: number;
}

export interface RegistryConfigOptions {
  server?: string;
  username?: string;
  passwordSecrets?: string[];
}

export interface BuilderConfigOptions {
  arch?: string;
  args?: Record<string, string>;
}

export interface EnvironmentConfigOptions {
  clear?: Record<string, string>;
  secret?: string[];
}

export interface AccessoryConfig {
  image: string;
  host: string;
  port: number;
  env?: {
    clear?: Record<string, string>;
    secret?: string[];
  };
  files?: string[];
  directories?: string[];
}

export interface AccessoriesConfigOptions {
  [key: string]: AccessoryConfig;
}

export type ConfigurationOptions =
  | BasicConfigOptions
  | ServerConfig
  | ProxyConfigOptions
  | RegistryConfigOptions
  | BuilderConfigOptions
  | EnvironmentConfigOptions
  | AccessoriesConfigOptions
  | string[];

export type ConfigurationType =
  | 'basic'
  | 'servers'
  | 'proxy'
  | 'registry'
  | 'builder'
  | 'env'
  | 'accessories'
  | 'volumes';


