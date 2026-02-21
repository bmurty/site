# Development Container

This directory contains the configuration for a [Development Container](https://containers.dev/) for the Murty Website project.

## What's Included

The devcontainer provides a complete development environment with:

- **Deno 2.6.10**: The JavaScript/TypeScript runtime
- **Git & Git LFS**: Version control with large file support
- **direnv**: Automatic environment variable management
- **VS Code Deno Extension**: Full IDE support for Deno development

## Getting Started

### Prerequisites

- [Visual Studio Code](https://code.visualstudio.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Dev Containers Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

### Usage

1. Open this repository in VS Code
2. When prompted, click "Reopen in Container" (or run the command "Dev Containers: Reopen in Container")
3. VS Code will build the container and set up the development environment
4. Once loaded, the `postCreateCommand` will run `deno task setup` automatically to initialize the project

### Available Commands

After the container is running, you can use all the Deno tasks defined in `deno.json`:

```bash
deno task              # List all available tasks
deno task build        # Build the site
deno task web          # Start development server
deno task test         # Run tests
deno task lint         # Lint and format code
```

The development server (port 8000) is automatically forwarded to your local machine.

## Configuration Files

- `devcontainer.json`: Main configuration for the dev container
- `Dockerfile`: Custom Docker image with all required dependencies
