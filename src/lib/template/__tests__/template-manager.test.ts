
import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { TemplateManager } from '../index.js';
import { Framework } from '../../../types/index.js';
import * as fs from 'fs';
import { join } from 'path';

// Mock fs module
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn(),
  readFileSync: vi.fn(),
  rmdirSync: vi.fn()
}));

describe('TemplateManager', () => {
  const mockTemplateDir = '/mock/template/dir';

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup mock filesystem responses
    (fs.existsSync as Mock).mockImplementation(() => true);
    (fs.readFileSync as Mock).mockImplementation((path) => {
      if (path.includes('nextjs.dockerfile')) {
        return 'FROM node:${NODE_VERSION}\nWORKDIR /app\nCMD ${START_COMMAND}';
      }
      if (path.includes('deploy.yml')) {
        return 'name: Deploy\non: push';
      }
      return '';
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should generate Dockerfile for NextJS', async () => {
    const manager = new TemplateManager({
      framework: Framework.NEXTJS,
      dockerfile: true,
      githubAction: false,
      templateDir: mockTemplateDir,
      appName: 'test-app',
      githubUsername: 'test-user'
    });

    await manager.generate();

    expect(fs.writeFileSync).toHaveBeenCalled();
    const dockerfileCall = (fs.writeFileSync as Mock).mock.calls.find(
      call => call[0].endsWith('Dockerfile')
    );
    expect(dockerfileCall).toBeTruthy();
  });
});
