# Shango Deploy 🚀

Shango Deploy is a modern deployment tool that simplifies the process of deploying web applications. It provides a high-level configuration interface that generates deployment configurations for various frameworks and automatically provisions servers with best practices.

## Features ✨

- 🛠 **Framework Support**: Deploy applications built with:
  - Next.js
  - Remix
  - Nuxt.js
  - Svelte
  - AdonisJS
  - NestJS

- 🗄 **Database Integration**:
  - PostgreSQL
  - MySQL
  - SQLite
  - Redis (for caching)

- 🔧 **Server Provisioning**:
  - Automatic security hardening
  - Docker setup
  - Fail2Ban configuration
  - UFW firewall setup
  - SSL/TLS configuration
  - System monitoring

- 📦 **Built-in Templates**:
  - Dockerfile generation
  - GitHub Actions workflows
  - deployment configurations

## Installation 📥

```bash
npm install -g shango-deploy
```

## Quick Start 🚀

1. Initialize a new Shango configuration:

```bash
shango add
```

2. Follow the interactive prompts to configure your deployment.

3. Provision your servers:

```bash
shango provision
```

4. Deploy your application:

```bash
shango deploy
```

## Configuration 📝

Shango uses a YAML configuration file (`shango.yml`) to define your deployment setup:

```yaml
app:
  framework: nextjs
  domain: myapp.com
  packageManager: npm
  database: postgres
  cacheDatabase: redis

  servers:
    - environment: staging
      ipv4:
        - 33.34.20.3
        - 33.34.20.4
    - environment: production
      ipv4: 44.34.21.23
```

## Server Requirements 🖥

- Ubuntu 20.04 or newer
- SSH access with root privileges
- Open ports: 22 (SSH), 80 (HTTP), 443 (HTTPS)

## Security Best Practices 🔒

Shango automatically implements several security best practices:

- SSH hardening
- Automatic security updates
- Fail2Ban for brute force protection
- UFW firewall configuration
- SSL/TLS setup with Let's Encrypt
- System hardening

## Contributing 🤝

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## Architecture 🏗

Shango Deploy is built with a modular architecture:

- **High-Level Config Parser**: Converts user-friendly configuration to detailed deployment specs
- **Server Provisioner**: Handles server setup and security hardening
- **Template System**: Manages framework-specific configurations and files
- **Deployment Engine**: Orchestrates the deployment process

## License 📄

MIT License - see the [LICENSE](LICENSE) file for details

## Support 💬

- Documentation: [docs.shango-deploy.dev](https://docs.shango-deploy.dev)
- Issues: [GitHub Issues](https://github.com/your-username/shango-deploy/issues)
- Discord: [Join our community](https://discord.gg/shango-deploy)

## Credits 👏

Shango Deploy is inspired by various deployment tools and best practices from the community. Special thanks to:

- [Kamal](https://github.com/basecamp/kamal)
- [Spin](https://github.com/serversideup/spin)
- [Deployer](https://github.com/deployerphp/deployer)
- [Docker](https://www.docker.com/)
- [Let's Encrypt](https://letsencrypt.org/)

## Roadmap 🗺

- [ ] Support for more frameworks
- [ ] Zero-downtime deployments
- [ ] Custom deployment hooks
- [ ] Monitoring integration
- [ ] Backup management

---

Built with ❤️ by [devalade](https://devalade.me)
