import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Configuration
const config = {
  testTemplatesDir: '.shango-templates-test',
  mockConfigFiles: {
    'dockerfiles/nextjs.dockerfile': `
FROM node:\${NODE_VERSION}
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN \${BUILD_COMMAND}
CMD \${START_COMMAND}
    `,
    'github-actions/deploy.yml': `
name: Deploy
on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to \${ENVIRONMENT}
        run: |
          echo "Deploying \${APP_NAME} to \${ENVIRONMENT}"
    `
  },
  mockSecrets: {
    'GITHUB_TOKEN': 'mock_github_token',
    'SSH_KEY': 'mock_ssh_key'
  }
};

function setupTestEnvironment() {
  console.log('🚀 Setting up test environment...');

  try {
    // Create test templates directory
    console.log('\n📁 Creating test templates directory...');
    fs.mkdirSync(path.join(process.cwd(), config.testTemplatesDir, 'dockerfiles'), { recursive: true });
    fs.mkdirSync(path.join(process.cwd(), config.testTemplatesDir, 'github-actions'), { recursive: true });

    // Create mock template files
    console.log('📝 Creating mock template files...');
    Object.entries(config.mockConfigFiles).forEach(([filePath, content]) => {
      fs.writeFileSync(
        path.join(process.cwd(), config.testTemplatesDir, filePath),
        content.trim()
      );
    });

    // Create mock secrets file
    console.log('🔐 Creating mock secrets file...');
    const secretsContent = Object.entries(config.mockSecrets)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    fs.writeFileSync(
      path.join(process.cwd(), '.env.test'),
      secretsContent
    );

    // Create mock shango.yml for testing
    console.log('⚙️ Creating mock shango.yml...');
    const mockShangoConfig = {
      app: {
        name: 'test-app',
        github_username: 'test-user',
        framework: 'nextjs',
        domain: 'test.example.com',
        package_manager: 'npm'
      },
      databases: {
        primary: {
          type: 'postgresql',
          version: '14'
        },
        cache: {
          type: 'redis',
          version: '7'
        }
      },
      servers: [
        {
          environment: 'staging',
          hosts: ['test-staging.example.com']
        }
      ]
    };
    fs.writeFileSync(
      path.join(process.cwd(), 'shango.json'),
      JSON.stringify(mockShangoConfig, null, 2)
    );

    // Install test dependencies if not already present
    console.log('📦 Installing test dependencies...');
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const testDeps = [
      'vitest',
      '@vitest/coverage-c8',
      'tempy'
    ];

    let needsInstall = false;
    testDeps.forEach(dep => {
      if (!packageJson.devDependencies?.[dep]) {
        needsInstall = true;
      }
    });

    if (needsInstall) {
      execSync('npm install -D ' + testDeps.join(' '), { stdio: 'inherit' });
    }

    // Add test scripts to package.json if not present
    if (!packageJson.scripts?.test) {
      packageJson.scripts = {
        ...packageJson.scripts,
        test: 'vitest run',
        'test:watch': 'vitest',
        'test:coverage': 'vitest run --coverage'
      };
      fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    }

    console.log('\n✅ Test environment setup complete!');
    console.log('\nYou can now run tests using:');
    console.log('npm test         # Run tests once');
    console.log('npm run test:watch    # Run tests in watch mode');
    console.log('npm run test:coverage # Run tests with coverage report');

  } catch (error) {
    console.error('\n❌ Error setting up test environment:', error);
    process.exit(1);
  }
}

setupTestEnvironment();
