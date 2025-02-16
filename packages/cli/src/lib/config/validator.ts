import { z } from 'zod';
import { Framework } from '../../types/index.ts';

const HookSchema = z.object({
  command: z.string(),
  local: z.boolean().optional(),
  remote: z.boolean().optional(),
});

const HooksSchema = z.object({
  pre_deploy: z.array(HookSchema).optional(),
  post_deploy: z.array(HookSchema).optional(),
});

const UserSchema = z.object({
  username: z.string(),
  password: z.string(),
  groups: z.array(z.string()),
  authorized_keys: z.array(z.object({ public_key: z.string() })),
});

const EnvironmentSchema = z.object({
  name: z.string(),
  config: z.string(),
  hosts: z.union([z.string(), z.array(z.string())]),
  servers: z.union([z.string(), z.array(z.string())]),
});

export const ConfigSchema = z.object({
  app: z.object({
    name: z.string(),
    github_username: z.string(),
    framework: z.nativeEnum(Framework),
    domain: z.string(),
    port: z.number(),
  }),
  environment: z.array(EnvironmentSchema),
  users: z.array(UserSchema),
  hooks: HooksSchema,
});

export type ValidatedShangoConfig = z.infer<typeof ConfigSchema>;
