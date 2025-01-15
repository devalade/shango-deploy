
import { describe, it, expect, beforeEach } from 'vitest';
import { KamalConfigurationManager } from '../index.js';
import { mockShangoConfig } from './mocks.js';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { parse as parseYAML } from 'yaml';

describe('KamalConfigurationManager', () => {
  const configPath = join(process.cwd(), '.config', 'kamal.yml');

  beforeEach(() => {
    // Setup test environment
    mkdirSync(join(process.cwd(), '.config'), { recursive: true });

    // Create mock initial kamal.yml
    const initialConfig = {
      service: 'test-app',
      image: 'test-image',
      registry: {
        server: 'ghcr.io',
        username: 'test-user',
        password: ['GITHUB_TOKEN']
      },
      servers: {
        production: ['test.example.com']
      }
    };

    writeFileSync(configPath, JSON.stringify(initialConfig));
  });

  it('should update existing kamal.yml with new configuration', async () => {
    const manager = new KamalConfigurationManager(mockShangoConfig);
    await manager.update();

    const updatedConfig = parseYAML(readFileSync(configPath, 'utf8'));

    expect(updatedConfig.service).toBe(mockShangoConfig.app.name);
    expect(updatedConfig.registry.username).toBe(mockShangoConfig.app.github_username);
    expect(updatedConfig.servers).toHaveProperty('staging');
    expect(updatedConfig.servers).toHaveProperty('production');
  });
