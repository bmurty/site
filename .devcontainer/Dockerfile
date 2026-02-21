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
  && update-ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Configure direnv for automatic loading
RUN echo 'eval "$(direnv hook bash)"' >> ~/.bashrc

# Set up working directory
WORKDIR /workspace

# Keep container running and use bash as default shell
CMD ["/bin/bash"]
