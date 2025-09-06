# 🚀 ProductivU - LAN Deployment Guide

## 🌐 Access Your App From Any Device

Your **ProductivU** app can be accessed from any device on your network using these URLs:

- **🖥️ This PC**: http://localhost:3000
- **📱 Mobile/Other PCs**: http://192.168.213.22:3000

## 🚀 Quick Start - Temporary Deployment

### Option 1: Simple PowerShell Script (Recommended for Testing)

```powershell
# Run this command in PowerShell (as Administrator)
.\deploy-lan.ps1
```

### Option 2: Manual Command
```bash
# Run this in your terminal
serve -s dist -l 3000
```

---

## 🔥 Permanent Deployment (Runs Forever)

### Option 1: PM2 Process Manager (Recommended)

1. **Install PM2 globally:**
```bash
npm install -g pm2
```

2. **Start the app permanently:**
```bash
pm2 start ecosystem.config.js
```

3. **Set up auto-start on PC restart:**
```bash
pm2 startup
pm2 save
```

4. **Manage the app:**
```bash
pm2 status          # Check status
pm2 logs ProductivU  # View logs
pm2 stop ProductivU  # Stop app
pm2 restart ProductivU  # Restart app
pm2 delete ProductivU   # Remove app
```

### Option 2: Windows Service (Advanced)

1. **Install PM2 as Windows Service:**
```bash
npm install -g pm2-windows-service
pm2-service-install
```

2. **Start service:**
```bash
pm2-service-start
```

---

## 🔥 Firewall Configuration

### Windows Firewall (Automatic)
The deployment script automatically adds firewall rules, but you can do it manually:

```powershell
# Add firewall rule for port 3000
New-NetFirewallRule -DisplayName "ProductivU-3000" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

### Router Configuration (If Needed)
If you can't access from mobile devices:
1. Open Windows Defender Firewall
2. Allow "serve" or "node" through firewall
3. Or temporarily disable firewall for testing

---

## 📱 Mobile Device Setup

### Android/iPhone
1. Connect to the same WiFi network
2. Open browser (Chrome/Safari)
3. Go to: `http://192.168.213.22:3000`
4. **Add to Home Screen** for app-like experience:
   - Chrome: Menu → "Add to Home screen"
   - Safari: Share → "Add to Home Screen"

### Mobile Optimization Features (Already Built-In)
- ✅ Touch-friendly interface (44px tap targets)
- ✅ Bottom navigation for mobile
- ✅ Responsive design (mobile-first)
- ✅ Dark mode support
- ✅ PWA-ready (can be installed as app)

---

## 💾 Data Management

### Current Storage
- **Local Storage**: Data is stored locally on each device
- **Per-Device**: Each device maintains its own data

### Backup & Export
```javascript
// Built-in export/import functions in Settings page
storageManager.exportData()  // Export all data
storageManager.importData(data)  // Import data
```

### Data Location
```
Browser Local Storage:
- Tasks: productivity_tasks
- Habits: productivity_habits  
- Challenges: productivity_challenges
- Settings: productivity_preferences
```

---

## 🛠️ Troubleshooting

### Can't Access from Mobile?
1. **Check IP Address**: Run `ipconfig` to confirm IP
2. **Firewall**: Ensure port 3000 is open
3. **Same Network**: Ensure all devices on same WiFi
4. **Browser Cache**: Clear browser cache on mobile
5. **Router**: Some routers block device-to-device communication

### Performance Issues?
1. **Build Production**: Ensure you're serving `dist/` folder
2. **Memory**: Restart PM2 if memory usage is high
3. **Browser**: Use modern browsers (Chrome, Firefox, Safari)

### Data Not Syncing?
- **Expected**: Each device stores its own data locally
- **Solution**: Use export/import feature to transfer data
- **Future**: Implement database backend for sync

---

## 🚀 Production Deployment Options

### Option 1: Keep Current Setup
- ✅ Perfect for home/office LAN use
- ✅ No external dependencies
- ✅ Fast and reliable

### Option 2: Add Database (Future)
```bash
# Example with MongoDB
npm install mongoose
# Add database connection in storage.ts
```

### Option 3: Cloud Deployment
```bash
# Deploy to Vercel/Netlify
npm install -g vercel
vercel --prod
```

---

## 🎯 Success Checklist

- [ ] Build completed (`npm run build`)
- [ ] Firewall rule added for port 3000
- [ ] PM2 installed and app started
- [ ] App accessible on `http://localhost:3000`
- [ ] App accessible from mobile on `http://192.168.213.22:3000`
- [ ] Auto-start configured (`pm2 startup` + `pm2 save`)

## 🎉 You're Done!

Your **ProductivU** app is now running permanently on your network and accessible from any device! 

**Next Steps:**
- 📱 Add to mobile home screen
- 🗂️ Start creating tasks, habits, and challenges  
- 🌙 Try dark/light mode toggle
- 💾 Test export/import functionality
- 🔄 Set up auto-backups (optional)

---

**Need Help?** Check the troubleshooting section or restart the deployment with `pm2 restart ProductivU`.
