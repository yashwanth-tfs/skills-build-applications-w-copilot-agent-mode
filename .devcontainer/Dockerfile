# Devcontainer configuration for CodeGen Automator
# This ensures a consistent development environment in Codespaces

FROM mcr.microsoft.com/devcontainers/python:3.11

# Install Node.js for Angular projects
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Install Angular CLI globally
RUN npm install -g @angular/cli

# Install Python tools
RUN pip install --upgrade pip \
    && pip install cookiecutter black flake8

# Install GitHub CLI
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
    && chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && apt-get update \
    && apt-get install -y gh

# Set up workspace
WORKDIR /workspace

# Expose common ports
EXPOSE 3000 4200 5000 8000 8080
