# 🚀 ProductivU - Complete Deployment Guide

This comprehensive guide covers multiple deployment strategies for your React TODO app across different environments.

## 📋 Table of Contents

1. [Pre-Deployment Setup](#pre-deployment-setup)
2. [Local Development Deployment](#local-development-deployment)
3. [Docker Deployment](#docker-deployment)
4. [PM2 Process Management](#pm2-process-management)
5. [Cloud VPS Deployment](#cloud-vps-deployment)
6. [Environment Configuration](#environment-configuration)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

## 🔧 Pre-Deployment Setup

### Prerequisites

```bash
# Required software
- Node.js (v18 or higher)
- npm or yarn
- Docker (for containerized deployment)
- PM2 (for process management)
- Git (for version control)
```

### Initial Setup

```bash
# 1. Install global dependencies
npm install -g serve pm2

# 2. Install project dependencies
npm install

# 3. Create environment files
cp .env.example .env.production

# 4. Build the application
npm run build
```

## 🏠 Local Development Deployment

### Quick Local Network Setup

```bash
# Method 1: Using npm serve
npm run start

# Method 2: Using serve directly
serve -s dist -p 8080 --host 0.0.0.0 --cors

# Method 3: Using PM2 (recommended for permanent deployment)
npm run start:pm2
```

### Network Access

Your app will be available at:
- Local: `http://localhost:8080`
- Network: `http://YOUR_IP_ADDRESS:8080`
- Mobile devices: `http://192.168.x.x:8080`

## 🐳 Docker Deployment

Your existing Docker setup is production-ready! Here are the deployment options:

### Single Container Deployment

```bash
# Build and run production container
docker build -t productiv-app .
docker run -d \
  --name productiv-app \
  -p 8080:8080 \
  --restart unless-stopped \
  productiv-app
```

### Docker Compose Deployment (Recommended)

```bash
# Production deployment with docker-compose
npm run deploy:docker

# Or manually:
docker-compose --profile prod up -d

# With database (for future scaling)
docker-compose --profile prod --profile db up -d

# With reverse proxy
docker-compose --profile prod --profile proxy up -d
```

### Docker Commands Reference

```bash
# View running containers
docker ps

# View logs
docker logs productiv-app

# Stop container
docker stop productiv-app

# Update deployment
docker-compose pull && docker-compose up -d

# Cleanup
docker system prune -a
```

## ⚡ PM2 Process Management

Your PM2 configuration is already optimized for production.

### Basic PM2 Commands

```bash
# Start application
npm run start:pm2

# Monitor processes
pm2 monit

# View logs
npm run logs:pm2

# Restart application
npm run restart:pm2

# Stop application
npm run stop:pm2

# Auto-start on system boot
pm2 startup
pm2 save
```

### PM2 Advanced Features

```bash
# Cluster mode (multiple instances)
pm2 start pm2.config.js -i max

# Zero-downtime deployment
pm2 reload productiv-u

# Memory usage monitoring
pm2 show productiv-u

# Process health check
pm2 ping
```

## ☁️ Cloud VPS Deployment

### Option 1: Digital Ocean Droplet

```bash
# 1. Create Ubuntu 22.04 droplet (min $6/month)
# 2. SSH into server
ssh root@your-server-ip

# 3. Server setup
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
apt update && apt install -y nodejs npm nginx

# 4. Deploy application
git clone https://github.com/your-username/productivity-app.git
cd productivity-app
npm install
npm run build
npm run deploy:docker
```

### Option 2: AWS EC2 (Free Tier)

```bash
# 1. Launch t2.micro Ubuntu instance
# 2. Configure security groups (ports 22, 80, 8080)
# 3. SSH and setup

# Install Docker
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Deploy application
git clone https://github.com/your-username/productivity-app.git
cd productivity-app
sudo docker-compose --profile prod up -d
```

### Option 3: Linode VPS

```bash
# 1. Create Nanode (shared CPU, $5/month)
# 2. Choose Ubuntu 22.04 LTS
# 3. Setup deployment similar to Digital Ocean
```

## 🌐 Environment Configuration

### Environment Files Structure

```
.env.example          # Template file
.env.local           # Local development overrides
.env.development     # Development configuration
.env.production      # Production configuration
```

### Key Environment Variables

```bash
# Application
VITE_APP_NAME=ProductivU
VITE_APP_VERSION=1.0.0
VITE_PORT=8080

# Network
VITE_HOST=0.0.0.0
VITE_CORS_ORIGIN=*

# Features
VITE_ENABLE_PWA=true
VITE_ENABLE_OFFLINE=true

# Performance
VITE_BUNDLE_SIZE_LIMIT=1000
VITE_LAZY_LOADING=true
```

## 🔒 Security & Networking

### Firewall Configuration (Ubuntu/Debian)

```bash
# Enable firewall
sudo ufw enable

# Allow SSH (important!)
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Allow your app port
sudo ufw allow 8080

# Check status
sudo ufw status
```

### Nginx Reverse Proxy (Optional)

```nginx
# /etc/nginx/sites-available/productiv-app
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL Certificate (Let's Encrypt)

```bash
# Install certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoring & Maintenance

### Health Monitoring

```bash
# PM2 monitoring
pm2 monit

# Docker health checks
docker ps
docker stats

# System resources
htop
df -h
free -m
```

### Log Management

```bash
# PM2 logs
pm2 logs productiv-u

# Docker logs
docker logs productiv-app

# System logs
journalctl -u docker
```

### Backup Strategy

```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/productiv-app"

# Backup application data
tar -czf $BACKUP_DIR/productiv-app-$DATE.tar.gz /var/www/productivity-app

# Backup Docker data
docker exec productiv-app tar -czf - /app/data > $BACKUP_DIR/app-data-$DATE.tar.gz

echo "Backup completed: $DATE"
```

### Update Deployment

```bash
# PM2 deployment
git pull origin main
npm install
npm run build
pm2 reload productiv-u

# Docker deployment
git pull origin main
docker-compose build
docker-compose up -d
```

## 🚨 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Find process using port
sudo lsof -i :8080
sudo kill -9 <PID>
```

**Permission Issues**
```bash
# Fix file permissions
sudo chown -R $USER:$USER /var/www/productivity-app
chmod -R 755 /var/www/productivity-app
```

**Docker Issues**
```bash
# Restart Docker service
sudo systemctl restart docker

# Clean up Docker
docker system prune -a
docker volume prune
```

**Memory Issues**
```bash
# Check memory usage
free -m
htop

# PM2 memory restart
pm2 restart productiv-u
```

### Performance Optimization

```bash
# Enable gzip compression in nginx
gzip on;
gzip_vary on;
gzip_min_length 10240;
gzip_proxied expired no-cache no-store private must-revalidate;
gzip_types text/plain text/css text/xml text/javascript application/javascript;

# Optimize PM2 for production
pm2 start pm2.config.js -i max --max-memory-restart 150M
```

## 📱 Mobile Access Setup

1. **Connect devices to same network**
2. **Find your server IP:**
   ```bash
   # Linux/Mac
   ip addr show
   ifconfig
   
   # Windows
   ipconfig
   ```
3. **Access from mobile:**
   - Open browser on mobile device
   - Navigate to `http://YOUR_SERVER_IP:8080`
   - Add to home screen for app-like experience

## 🎯 Quick Deployment Commands

```bash
# Local development
npm run dev

# Local network deployment
npm run start

# PM2 production deployment
npm run build && npm run start:pm2

# Docker production deployment
npm run deploy:docker

# Cloud deployment (after server setup)
git clone <repo> && cd productivity-app && npm run deploy:docker
```

---

## 📞 Support & Maintenance

- **Logs Location**: `./logs/` (PM2) or `docker logs` (Docker)
- **Health Check**: Visit `http://your-server:8080`
- **Process Status**: `pm2 status` or `docker ps`
- **Resource Usage**: `pm2 monit` or `docker stats`

**🎉 Your ProductivU app is now ready for production deployment!**

Choose the deployment method that best fits your needs:
- **Local Network**: PM2 deployment
- **Containerized**: Docker deployment  
- **Cloud Production**: VPS with Docker
- **High Availability**: Docker Compose with reverse proxy

For additional help, check the logs and ensure all prerequisites are installed correctly.
