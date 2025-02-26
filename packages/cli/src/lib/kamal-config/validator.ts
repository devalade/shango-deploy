import { z } from 'zod';

export const EnvConfigSchema = z.object({
  clear: z.record(z.string()).optional(),
  secret: z.array(z.string()).optional(),
});

export const ServerJobSchema = z.object({
  hosts: z.array(z.string()),
  cmd: z.string(),
});

export const ServersSchema = z.object({
  web: z.array(z.string()),
  job: ServerJobSchema.optional(),
  cron: ServerJobSchema.optional(),
});

export const AccessoryServiceSchema = z.object({
  image: z.string(),
  host: z.string(),
  port: z.number(),
  env: EnvConfigSchema.optional(),
  files: z.array(z.string()).optional(),
  directories: z.array(z.string()).optional(),
});

const RegistrySchema = z.object({
  server: z.string().optional(),
  username: z.string(),
  password: z.union([z.string(), z.array(z.string())]),
});

export const BuilderSchema = z.object({
  ssh: z.string().optional(),
  driver: z.string().optional(),
  arch: z.union([
    z.literal('amd64'),
    z.literal('arm64'),
    z.array(z.union([z.literal('amd64'), z.literal('arm64')])),
  ]),
  remote: z.string().optional(),
  local: z.boolean().optional(),
  context: z.string().optional(),
  dockerfile: z.string().optional(),
  target: z.string().optional(),
  provenance: z.string().optional(),
  sbom: z.boolean().optional(),
  cache: z
    .object({
      type: z.union([z.literal('gha'), z.literal('registry')]),
      options: z.string(),
      image: z.string(),
    })
    .optional(),
  args: z.record(z.string()).optional(),
  secrets: z.record(z.string()).optional(),
});

export const SSHSchema = z.object({
  user: z.string().optional(),
  port: z.string().optional(),
  proxy: z.string().optional(),
  log_level: z.string().optional(),
  keys_only: z.boolean().optional(),
  keys: z.array(z.string()).optional(),
  key_data: z.array(z.string()).optional(),
  config: z.boolean().optional(),
});

export const SSHKitSchema = z.object({
  max_concurrent_starts: z.number(),
  pool_idle_timeout: z.number(),
});

export const BootSchema = z.object({
  limit: z.union([z.number(), z.string()]),
  wait: z.number(),
});

export const LoggingOptionsSchema = z.object({
  driver: z.string().optional(),
  options: z.object({
    'max-size': z.string(),
  }),
});

export const KamalConfigSchema = z.object({
  service: z.string(),
  image: z.string(),
  servers: ServersSchema,
  args: z.record(z.string()).optional(),
  secrets: z.record(z.string()).optional(),
  env: EnvConfigSchema.optional(),
  registry: RegistrySchema,
  builder: BuilderSchema,
  aliases: z.record(z.string()).optional(),
  ssh: SSHSchema.optional(),
  sshkit: SSHKitSchema.optional(),
  volumes: z.array(z.string()).optional(),
  asset_path: z.string().optional(),
  boot: BootSchema.optional(),
  accessories: z.record(AccessoryServiceSchema).optional(),
  loging: LoggingOptionsSchema.optional(),
});

export type ValidatedShangoConfig = z.infer<typeof KamalConfigSchema>;

export class KamalConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'KamalConfigurationError';
  }
}
