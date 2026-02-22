# Multi-stage Dockerfile for local development and production deployment
# Supports deployment to ECS and other container-based infrastructure

# Stage 1: Base image with Deno
FROM denoland/deno:2.6.10 AS base

# Install system dependencies required for build process
RUN apt-get update && apt-get install -y \
  curl \
  git \
  ca-certificates \
  && update-ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Stage 2: Dependencies
FROM base AS deps

# Copy dependency files
COPY deno.json deno.lock ./

# Cache the dependencies
RUN deno install --entrypoint deno.json

# Stage 3: Builder
FROM base AS builder

# Copy dependency files and install
COPY deno.json deno.lock ./
RUN deno install --entrypoint deno.json

# Copy all source files
COPY . .

# Setup environment file if it's not there already
RUN cp --update=none .env.example .env

# Create required directories
RUN mkdir -p build public

# Build the site using the build script
ENV DENO_TLS_CA_STORE=system
RUN deno task build

# Stage 4: Production runtime
FROM denoland/deno:alpine-2.6.10 AS production

WORKDIR /app

# Copy the server script (no external dependencies)
COPY src/docker-server.ts ./

# Copy only the built site
COPY --from=builder /app/_site ./_site

# Expose port for web server
EXPOSE 8000

# Run the static file server using the local script
CMD ["deno", "run", "--allow-net", "--allow-read", "--allow-env", "docker-server.ts"]

# Stage 5: Development
FROM base AS development

WORKDIR /app

# Copy all files for development
COPY . .

# Setup environment file if it's not there already
RUN cp --update=none .env.example .env

# Create required directories
RUN mkdir -p build public

# Expose port for development server
EXPOSE 8000

# Default command for development (can be overridden)
CMD ["deno", "run", "--allow-net", "--allow-read", "--allow-env", "docker-server.ts"]
