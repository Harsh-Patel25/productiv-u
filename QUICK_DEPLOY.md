# 🚀 ProductivU - Quick Deployment Reference

## ⚡ One-Command Deployments

```bash
# Local Network (PM2)
npm run start:pm2

# Docker Production
npm run deploy:docker

# Windows Local
npm run deploy:windows

# Linux Auto-Deploy
./scripts/deploy-linux.sh --pm2 --nginx --ssl --domain=yourdomain.com
```

## 📦 Environment Setup

```bash
# 1. Setup deployment environment
./scripts/setup-deployment.sh

# 2. Configure environment
cp .env.example .env.production
# Edit .env.production with your settings

# 3. Build application
npm run build
```

## 🌐 Quick Cloud Deployment (VPS)

### Digital Ocean / Linode / AWS EC2

```bash
# 1. SSH to server
ssh user@your-server-ip

# 2. Clone and deploy
git clone <your-repo>
cd productivity-app
./scripts/deploy-linux.sh --docker --nginx
```

## 📱 Network Access URLs

After deployment, your app will be available at:

- **Local**: `http://localhost:8080`
- **LAN**: `http://192.168.x.x:8080` (your local IP)
- **Mobile**: Same LAN URL from mobile browser
- **Domain**: `https://yourdomain.com` (if configured)

## 🛠️ Management Commands

```bash
# PM2 Management
pm2 status                    # Check status
pm2 restart productiv-u       # Restart app
pm2 logs productiv-u         # View logs
pm2 monit                    # Monitor resources

# Docker Management
docker ps                    # Check containers
docker logs productiv-app    # View logs  
docker restart productiv-app # Restart container
docker-compose up -d         # Start with compose

# Health Monitoring
./scripts/health-check.sh --verbose --auto-restart
```

## 🔧 Quick Troubleshooting

```bash
# Port issues
sudo lsof -i :8080          # Check what's using port
sudo kill -9 <PID>          # Kill process

# Build issues
rm -rf dist node_modules    # Clean build
npm install                 # Reinstall dependencies
npm run build              # Rebuild

# Permission issues
sudo chown -R $USER:$USER . # Fix ownership
chmod +x scripts/*.sh       # Make scripts executable

# Firewall issues (Ubuntu)
sudo ufw allow 8080         # Allow port
sudo ufw status            # Check firewall
```

## 📊 Monitoring & Logs

```bash
# Application logs location
./logs/                    # PM2 logs
docker logs productiv-app  # Docker logs

# Health check logs
/var/log/productiv-u-health.log  # Linux health logs

# System monitoring
htop                      # System resources
df -h                     # Disk usage
free -m                   # Memory usage
```

## 🔐 Security Checklist

- [ ] Environment variables configured (`.env.production`)
- [ ] Firewall rules configured (ports 80, 443, 8080)
- [ ] SSL certificate installed (if using domain)
- [ ] Regular security updates scheduled
- [ ] Backup strategy implemented
- [ ] Health monitoring active

## 🎯 Production Ready Checklist

- [ ] Application built successfully (`npm run build`)
- [ ] Environment variables set
- [ ] Process manager configured (PM2/Docker)
- [ ] Reverse proxy setup (optional but recommended)
- [ ] SSL certificate (for production domains)
- [ ] Firewall configured
- [ ] Health monitoring enabled
- [ ] Backup strategy in place
- [ ] Domain DNS configured (if applicable)

## 📞 Quick Support

**Check Status**: Visit `http://your-server:8080` in browser

**Common Fixes**:
1. Restart: `pm2 restart productiv-u` or `docker restart productiv-app`
2. Rebuild: `npm run build && npm run start:pm2`
3. Health Check: `./scripts/health-check.sh --verbose`

**Emergency Redeploy**:
```bash
git pull && npm install && npm run build && pm2 reload productiv-u
```

---

🎉 **Your ProductivU app is ready for production!**

Choose your deployment method and follow the commands above. The app will be accessible on your local network and can be easily accessed from any device on the same network.
