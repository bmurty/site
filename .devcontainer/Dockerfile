# Use Deno's official image as base
FROM denoland/deno:2.6.10

# Install system dependencies required by the setup script and development
RUN apt-get update && apt-get install -y \
  curl \
  git \
  git-lfs \
  direnv \
  ca-certificates \
  bash \
  sudo \
  && update-ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Add deno user to sudoers for setup tasks
RUN echo "deno ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers

# Create home directory for the deno user (not present in base image)
RUN mkdir -p /home/deno && chown deno:deno /home/deno

# Switch to deno user
USER deno

# Configure direnv for automatic loading
RUN echo 'eval "$(direnv hook bash)"' >> ~/.bashrc

# Set up working directory
WORKDIR /workspace

# Keep container running and use bash as default shell
CMD ["/bin/bash"]
