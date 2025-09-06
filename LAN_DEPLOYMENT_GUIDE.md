# ProductivU - LAN Deployment Guide

## 🚀 Quick Start for LAN Access

This guide will help you deploy the ProductivU productivity app permanently on your local network, making it accessible from PCs and mobile devices.

## Prerequisites

- Node.js (v18 or higher)
- NPM or Yarn package manager
- Network router/switch
- Firewall configuration access

## Step 1: Build the Production App

```bash
# Navigate to the project directory
cd productivity-app

# Install dependencies (if not already done)
npm install

# Build the production version
npm run build
```

This creates a `dist` folder with optimized production files.

## Step 2: Install Serve Globally

```bash
# Install the serve package globally
npm install -g serve
```

## Step 3: Find Your Local IP Address

### On Windows:
```cmd
ipconfig
```
Look for your IPv4 Address (usually something like 192.168.1.x or 10.0.0.x)

### On macOS/Linux:
```bash
ifconfig
# or
ip addr show
```

## Step 4: Serve on LAN

### Option 1: Using serve (Recommended)
```bash
# Serve on all network interfaces (accessible from LAN)
serve -s dist -l 3000 --host 0.0.0.0

# Alternative with custom port
serve -s dist -l 8080 --host 0.0.0.0
```

### Option 2: Using PM2 (For Permanent Service)
```bash
# Install PM2 globally
npm install -g pm2

# Create ecosystem file
# See pm2.config.js below

# Start with PM2
pm2 start pm2.config.js
pm2 save
pm2 startup
```

### Option 3: Using Python (Alternative)
```bash
# Python 3
cd dist
python -m http.server 8080 --bind 0.0.0.0

# Python 2
cd dist
python -m SimpleHTTPServer 8080
```

## Step 5: Configure Firewall

### Windows Firewall:
1. Open Windows Defender Firewall
2. Click "Allow an app or feature through Windows Defender Firewall"
3. Click "Change Settings" then "Allow another app..."
4. Add your serve/node application
5. Ensure both Private and Public networks are checked (if needed)

### Alternative Windows Method:
```cmd
# Run as Administrator
netsh advfirewall firewall add rule name="ProductivU App" dir=in action=allow protocol=TCP localport=3000
```

### macOS Firewall:
```bash
# Allow connections on port 3000
sudo pfctl -f /etc/pf.conf
# Or use System Preferences > Security & Privacy > Firewall
```

### Linux (Ubuntu/Debian):
```bash
# Using UFW
sudo ufw allow 3000
sudo ufw reload

# Using iptables
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
```

## Step 6: Access from Other Devices

Once running, access the app from any device on your network:

```
http://YOUR_IP_ADDRESS:3000
```

Example: `http://192.168.1.100:3000`

### Mobile Device Setup:
1. Connect your mobile device to the same WiFi network
2. Open any web browser (Chrome, Safari, Firefox)
3. Navigate to `http://YOUR_IP_ADDRESS:3000`
4. Add to home screen for app-like experience:
   - **iOS Safari**: Tap Share > Add to Home Screen
   - **Android Chrome**: Tap Menu (⋮) > Add to Home screen

## PM2 Configuration File

Create `pm2.config.js` in your project root:

```javascript
module.exports = {
  apps: [{
    name: 'productiv-u',
    script: 'serve',
    args: '-s dist -l 3000 --host 0.0.0.0',
    cwd: __dirname,
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

## Step 7: Make It Permanent

### Using PM2 (Linux/macOS):
```bash
# Start the app
pm2 start pm2.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions shown

# Check status
pm2 status
pm2 logs productiv-u
```

### Using Windows Task Scheduler:
1. Open Task Scheduler
2. Create Basic Task
3. Set trigger to "When the computer starts"
4. Action: "Start a program"
5. Program: `cmd`
6. Arguments: `/c cd /d "C:\path\to\your\app" && serve -s dist -l 3000 --host 0.0.0.0`

### Using Windows Service (Advanced):
```bash
# Install node-windows
npm install -g node-windows

# Create a service script (see service.js below)
node service.js
```

## Troubleshooting

### Common Issues:

1. **Can't access from other devices**:
   - Check firewall settings
   - Ensure you're using `--host 0.0.0.0`
   - Verify all devices are on same network
   - Try disabling firewall temporarily to test

2. **Port already in use**:
   ```bash
   # Check what's using the port
   netstat -ano | findstr :3000
   # Kill the process or use a different port
   ```

3. **Mobile browser issues**:
   - Clear browser cache
   - Try incognito/private mode
   - Ensure HTTPS isn't being forced

4. **App doesn't persist data across devices**:
   - This is expected - data is stored locally per device
   - For shared data, consider future cloud migration

### Performance Tips:

1. **Optimize for mobile**:
   - App is already responsive
   - Use WiFi for best performance
   - Close other browser tabs

2. **Network performance**:
   - Use 5GHz WiFi when available
   - Consider wired connection for host device
   - Monitor network usage

## Advanced Configuration

### Custom Domain (Local DNS):
1. Edit router settings
2. Add custom DNS entry: `productiv-u.local -> YOUR_IP`
3. Access via `http://productiv-u.local:3000`

### HTTPS Setup (Optional):
```bash
# Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Serve with HTTPS
serve -s dist -l 3000 --ssl-cert cert.pem --ssl-key key.pem --host 0.0.0.0
```

### Reverse Proxy (nginx):
```nginx
server {
    listen 80;
    server_name productiv-u.local;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Monitoring and Maintenance

### Check Service Status:
```bash
# PM2
pm2 status
pm2 logs productiv-u

# Manual serve
# Check if process is running
netstat -ano | findstr :3000
```

### Restart Service:
```bash
# PM2
pm2 restart productiv-u

# Manual serve
# Kill and restart the serve command
```

### Update App:
```bash
# Pull latest changes
git pull origin main

# Rebuild
npm run build

# Restart service
pm2 restart productiv-u
```

## Security Considerations

1. **Local Network Only**: App runs on local network, not accessible from internet
2. **No Authentication**: Consider adding authentication for multi-user environments
3. **Data Privacy**: All data stored locally on each device
4. **Firewall**: Only open necessary ports
5. **Regular Updates**: Keep dependencies updated

## Future Scaling Options

### Cloud Migration:
1. Deploy to Vercel, Netlify, or AWS
2. Add database backend (PostgreSQL, MongoDB)
3. Implement user authentication
4. Add real-time sync across devices

### Database Integration:
1. Add SQLite for local multi-user support
2. Implement PostgreSQL for full multi-user
3. Add API backend with Express.js or FastAPI

### Multi-User Features:
1. User accounts and authentication
2. Shared tasks and challenges
3. Team productivity tracking
4. Real-time collaboration

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify network configuration
3. Check browser console for errors
4. Ensure latest version is deployed

## Example Service Script (service.js)

```javascript
const Service = require('node-windows').Service;

// Create a new service object
const svc = new Service({
  name: 'ProductivU App',
  description: 'ProductivU Productivity App Server',
  script: require('path').join(__dirname, 'server.js'),
  nodeOptions: [
    '--harmony',
    '--max_old_space_size=4096'
  ]
});

// Listen for the "install" event, which indicates the process is available as a service.
svc.on('install', function() {
  svc.start();
});

svc.install();
```

---

**Happy Productivity! 🎯**

Your ProductivU app is now accessible across your entire local network. Enjoy managing tasks, building habits, and completing challenges from any device!
