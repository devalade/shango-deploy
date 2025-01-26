import { z } from 'zod';
import { type KamalConfig } from './types.ts';

const KamalConfigSchema = z.object({
  service: z.string(),
  image: z.string(),
  registry: z.object({
    server: z.string(),
    username: z.string(),
    password: z.array(z.string())
  }),
  servers: z.record(z.array(z.string())),
  env: z.object({
    clear: z.record(z.string()).optional(),
    secret: z.array(z.string()).optional()
  }).optional(),
  accessories: z.record(z.any()).optional(),
  healthcheck: z.object({
    path: z.string(),
    port: z.number(),
    interval: z.number(),
    timeout: z.number(),
    retries: z.number()
  }).optional(),
  rolling_deploy: z.object({
    max_parallel: z.number(),
    delay: z.number()
  }).optional(),
  hooks: z.object({
    pre_deploy: z.array(z.string()).optional(),
    post_deploy: z.array(z.string()).optional()
  }).optional()
});

export function validateKamalConfig(config: unknown): KamalConfig {
  return KamalConfigSchema.parse(config);
}
