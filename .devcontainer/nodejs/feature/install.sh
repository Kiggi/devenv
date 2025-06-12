echo "
██    ██ ████  ██████    ██████   ████ 
██   ██   ██  ██    ██  ██    ██   ██  
██  ██    ██  ██        ██         ██  
█████     ██  ██   ████ ██   ████  ██  
██  ██    ██  ██    ██  ██    ██   ██  
██   ██   ██  ██    ██  ██    ██   ██  
██    ██ ████  ██████    ██████   ████ 
"

echo "Installing Node.js..."

# Check if Node.js is already installed
if command -v node > /dev/null
then
    echo "Node.js is already installed."
    exit 0
else
    echo "Node.js is not installed. Proceeding with installation..."
fi

# Download and install nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.2/install.sh | bash
# in lieu of restarting the shell
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion" # This loads nvm bash_completion
# Download and install Node.js:
nvm install ${NODE_VERSION}
# Set the default Node.js version:
nvm use ${NODE_VERSION}
# Download and install pnpm:
corepack enable pnpm
# export PNPM_HOME="/home/vscode/.local/share/pnpm"
export SHELL="/bin/bash"
pnpm setup
cat ~/.bashrc | bash
# Update pnpm to the latest version:
pnpm add -g pnpm@${PNPM_VERSION}
