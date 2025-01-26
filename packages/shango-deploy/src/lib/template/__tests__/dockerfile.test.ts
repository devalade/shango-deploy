import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DockerfileTemplate } from '../dockerfile.ts';
import { Framework } from '../../../types/index.ts';
import { existsSync, mkdirSync, rmdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('DockerfileTemplate', () => {
  let tempDir: string;
  let templateDir: string;

  beforeEach(() => {
    tempDir = join(tmpdir(), `test-${Date.now()}`);
    templateDir = join(tempDir, 'templates');
    mkdirSync(join(templateDir, 'dockerfiles'), { recursive: true });

    // Create sample Dockerfile template
    writeFileSync(
      join(templateDir, 'dockerfiles', 'nex.ts.dockerfile'),
      'FROM node:${NODE_VERSION}\nWORKDIR /app\nCMD ${START_COMMAND}'
    );
  });

  afterEach(() => {
    rmdirSync(tempDir, { recursive: true });
  });

  it('should generate valid Dockerfile for NextJS', async () => {
    const template = new DockerfileTemplate({
      framework: Framework.NEXTJS,
      dockerfile: true,
      githubAction: false,
      templateDir,
      appName: 'test-app',
      githubUsername: 'test-user'
    });

    await template.generate();

    const dockerfile = readFileSync(join(process.cwd(), 'Dockerfile'), 'utf8');
    expect(dockerfile).toContain('FROM node:18');
    expect(dockerfile).toContain('WORKDIR /app');
    expect(dockerfile).toContain('CMD npm start');
  });

  // Add more tests for other frameworks and error cases
});
