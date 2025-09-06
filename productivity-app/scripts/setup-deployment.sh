#!/bin/bash

# Setup deployment environment
# This script makes other deployment scripts executable and sets up the environment

echo "🔧 Setting up ProductivU deployment environment..."

# Make scripts executable
chmod +x scripts/*.sh
echo "✅ Made deployment scripts executable"

# Create necessary directories
mkdir -p logs
mkdir -p backup
echo "✅ Created necessary directories"

# Install global dependencies if not present
if ! command -v serve &> /dev/null; then
    echo "📦 Installing serve globally..."
    npm install -g serve
fi

if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2 globally..."
    npm install -g pm2
fi

# Create cron job for health checks (optional)
read -p "Would you like to setup automated health checks? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Add health check to crontab (every 5 minutes)
    (crontab -l 2>/dev/null; echo "*/5 * * * * /bin/bash $(pwd)/scripts/health-check.sh --auto-restart") | crontab -
    echo "✅ Health check scheduled (every 5 minutes)"
fi

echo ""
echo "🎉 Deployment environment setup complete!"
echo ""
echo "Available deployment commands:"
echo "  npm run deploy:docker     - Deploy with Docker"
echo "  npm run start:pm2         - Deploy with PM2" 
echo "  npm run deploy:windows    - Windows deployment"
echo ""
echo "Available scripts:"
echo "  ./scripts/deploy-linux.sh  - Linux deployment script"
echo "  ./scripts/health-check.sh  - Health monitoring script"
echo ""
