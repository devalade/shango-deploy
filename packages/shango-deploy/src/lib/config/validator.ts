import { z } from 'zod';
import { Framework, DatabaseType, CacheType, PackageManager } from '../../types/index.ts';

const HealthcheckSchema = z.object({
  path: z.string(),
  port: z.number().int().positive(),
  interval: z.number().int().positive(),
  timeout: z.number().int().positive(),
  retries: z.number().int().positive()
});

const DeploymentSchema = z.object({
  strategy: z.enum(['rolling', 'all-at-once']),
  max_parallel: z.number().int().positive(),
  delay: z.number().int().positive(),
  healthcheck: HealthcheckSchema
});

const DatabaseSchema = z.object({
  type: z.nativeEnum(DatabaseType),
  version: z.string(),
  host: z.string().optional(),
  port: z.number().int().positive().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  database: z.string().optional()
});

const ServerSchema = z.object({
  environment: z.string(),
  hosts: z.array(z.string()),
  roles: z.array(z.string()).optional()
});

const HookSchema = z.object({
  command: z.string(),
  local: z.boolean().optional(),
  remote: z.boolean().optional(),
  condition: z.string().optional(),
  timeout: z.number().positive().optional()
});

const HooksSchema = z.object({
  pre_deploy: z.array(HookSchema).optional(),
  post_deploy: z.array(HookSchema).optional(),
  pre_provision: z.array(HookSchema).optional(),
  post_provision: z.array(HookSchema).optional()
});

const UserSchema = z.object({
  username: z.string(),
  groups: z.array(z.string()),
  create_home: z.boolean(),
  force_password_change: z.boolean(),
  ssh_keys: z.array(z.string())
});

const VolumeSchema = z.object({
  name: z.string(),
  path: z.string()
});

const EnvSchema = z.object({
  clear: z.record(z.string()).optional(),
  secret: z.array(z.string()).optional()
});

export const ShangoConfigSchema = z.object({
  app: z.object({
    name: z.string(),
    github_username: z.string(),
    framework: z.nativeEnum(Framework),
    domain: z.string(),
    package_manager: z.nativeEnum(PackageManager),
    port: z.number().int().positive().optional()
  }),
  databases: z.object({
    primary: DatabaseSchema.optional(),
    cache: DatabaseSchema.optional()
  }),
  servers: z.array(ServerSchema),
  deployment: DeploymentSchema,
  users: z.array(UserSchema),
  hooks: HooksSchema,
  volumes: z.array(VolumeSchema).optional(),
  env: EnvSchema.optional()
});

export type ValidatedShangoConfig = z.infer<typeof ShangoConfigSchema>;

export function validateConfig(config: unknown): ValidatedShangoConfig {
  return ShangoConfigSchema.parse(config);
}
