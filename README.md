# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Deployment

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### Docker Deployment

This project uses Docker Compose for simplified deployment with built-in security hardening.

#### Quick Start

```bash
# Build and run with docker-compose
docker-compose up -d --build

# Check logs
docker-compose logs -f

# Stop
docker-compose down
```

The application will be available at `http://localhost:8080`

#### Production Deployment Script

Use the `deploy.sh` script for automated deployment:

```bash
bash deploy.sh
```

The script will:
1. Stop any running containers
2. Build and start containers using docker-compose
3. Wait for container startup
4. Run health check at `/health` endpoint
5. Clean up old Docker images

### CI/CD with GitHub Actions

The GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically deploys on push to `main`:

1. Copies repository files to your VM via SCP
2. SSHs into the VM and runs `deploy.sh`

#### Required GitHub Secrets

Configure these in `Settings → Secrets and variables → Actions`:

- `VM_HOST`: VM public IP or hostname
- `VM_USER`: SSH username on the VM
- `VM_SSH_KEY`: Private SSH key content for authentication
- `VM_PORT`: SSH port (optional, defaults to `22`)
- `DEPLOY_PATH`: Absolute deployment path on VM (e.g., `/opt/voice-of-iran`)

### VM Prerequisites

- Docker and Docker Compose installed
- SSH user has permissions to run Docker commands
- Deployment path exists and is writable by SSH user
- Port 8080 available (or configure with `HOST_PORT` environment variable)

### Security Features

The deployment includes:
- **Non-root container**: Runs as unprivileged nginx user
- **Read-only filesystem**: With tmpfs mounts for necessary writable paths
- **Dropped capabilities**: Only NET_BIND_SERVICE retained
- **Resource limits**: CPU and memory constraints
- **Security headers**: CSP, X-Frame-Options, X-Content-Type-Options, etc.
- **Rate limiting**: Protection against abuse
- **No new privileges**: Security option enabled

### Configuration

Environment variables for `deploy.sh`:

```bash
HOST_PORT=8080          # Host port (default: 8080)
```

All other configuration (memory limits, security options, health checks) is in `docker-compose.yml`.
