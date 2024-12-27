import * as fs from 'fs';
import * as path from 'path';
import { Framework, ShangoConfig } from '../types/index.js';

type Option = {
  dockerfile: true,
  github?: Record<'ci' | 'cd', boolean>
};

export function template(framework: ShangoConfig['app']['framework'], option: Option) {
  const { dockerfile } = option;

  const validFrameworks: ShangoConfig['app']['framework'][] = [Framework.NEXTJS, Framework.REMIX, Framework.SVELTE, Framework.NESTJS, Framework.ADONISJS];
  if (!validFrameworks.includes(framework)) {
    throw new Error(`Invalid framework: ${framework}. Supported frameworks are: ${validFrameworks.join(', ')}`);
  }

  const sourcePath = path.resolve(__dirname, `../../templates/${framework}`);
  const destinationPath = process.cwd();

  if (dockerfile) {
    copyDockerfile(sourcePath, destinationPath);
  }
}

function copyDockerfile(source: string, destination: string) {
  const dockerfilePath = path.join(source, 'Dockerfile');
  const destinationPath = path.join(destination, 'Dockerfile');

  if (!fs.existsSync(dockerfilePath)) {
    throw new Error(`Dockerfile does not exist in the source directory: ${dockerfilePath}`);
  }

  fs.copyFileSync(dockerfilePath, destinationPath);
}
