# ProductivU - Full-Featured Productivity App 🎯

A comprehensive productivity application built with **Vite + React + TypeScript + Tailwind CSS** that runs permanently on your local network and is accessible from PCs and mobile devices.

## ✨ Features

### 📋 Task Management
- ✅ Create, update, delete tasks
- 🏷️ Categorize with custom labels and priorities
- 📅 Set due dates and reminders
- 🔍 Filter by status, priority, and date
- 📊 Track completion rates and statistics

### 🎯 Habit Tracking
- 🔄 Create daily/weekly habits
- 📈 Track progress with streaks
- 🔥 Visual habit completion indicators
- 📊 Habit statistics and completion rates
- ⏰ Reminder system for habits

### 🏆 Challenge System
- 🎮 Create personal challenges
- 📊 Track progress with visual indicators
- 🏅 Reward system for completion
- 📈 Challenge categories and custom goals
- ⏳ Time-bound challenge tracking

### 🎨 Modern UI & Design
- 🌓 Dark/Light mode toggle (with system preference detection)
- 📱 Fully responsive mobile-first design
- 🎨 Custom Tailwind CSS styling with beautiful animations
- 🚀 Smooth transitions and interactive elements
- 📱 Mobile-optimized touch targets

### 💾 Data Management
- 🗄️ Local JSON storage for all data
- 📤 Export data functionality
- 📥 Import data from backups
- 🔄 Data migration system
- 🧹 Automatic cleanup and optimization

### 🌐 LAN Deployment
- 🏠 Permanent local network deployment
- 📱 Cross-device accessibility (PC, mobile, tablet)
- 🔧 Easy setup with serve or PM2
- 🛡️ Firewall configuration guides
- ⚡ Optimized for local network performance

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd productivity-app

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the app in development mode.

## 🌐 LAN Deployment

### Quick LAN Setup

```bash
# 1. Build the production version
npm run build

# 2. Install serve globally
npm install -g serve

# 3. Serve on your network
serve -s dist -p 3000

# 4. Access from any device on your network
# http://YOUR_IP_ADDRESS:PORT
```

### Permanent Deployment with PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start the app with PM2
pm2 start pm2.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

For detailed LAN deployment instructions, see [LAN_DEPLOYMENT_GUIDE.md](./LAN_DEPLOYMENT_GUIDE.md).

## 🛠️ Development

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Technology Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 3.4 with custom configuration
- **Icons**: Lucide React
- **Routing**: React Router DOM 7
- **State Management**: React hooks with Context API
- **Date Handling**: date-fns
- **Storage**: Browser localStorage with custom abstraction layer

## 🏗️ Project Structure

```
productivity-app/
├── public/                 # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── Layout.tsx     # Main layout with navigation
│   │   ├── Dashboard.tsx  # Dashboard overview
│   │   ├── Tasks.tsx      # Task management
│   │   ├── Habits.tsx     # Habit tracking
│   │   ├── Challenges.tsx # Challenge system
│   │   └── Settings.tsx   # App settings
│   ├── contexts/          # React contexts
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript definitions
│   ├── utils/            # Utility functions
│   └── ...
├── tailwind.config.js     # Tailwind CSS configuration
├── pm2.config.js         # PM2 deployment configuration
└── LAN_DEPLOYMENT_GUIDE.md # Detailed LAN setup guide
```

## 📱 Mobile Access

The app is fully mobile-responsive:
1. Connect your mobile device to the same WiFi network
2. Open any web browser (Chrome, Safari, Firefox)
3. Navigate to `http://YOUR_IP_ADDRESS:PORT`
4. Add to home screen for app-like experience

## 🔮 Future Scaling Options

### Cloud Migration
- Deploy to Vercel, Netlify, or AWS
- Add database backend (PostgreSQL, MongoDB)
- Implement user authentication
- Real-time sync across devices

### Enhanced Features
- Team collaboration features
- Advanced analytics and reporting
- Calendar integration
- Email notifications
- Mobile app (React Native)

## 📞 Support

For detailed setup instructions and troubleshooting, see:
- [LAN Deployment Guide](./LAN_DEPLOYMENT_GUIDE.md)
- Check browser console for errors
- Verify network connectivity and firewall settings

---

**Happy Productivity! 🎯**

Built with ❤️ using React, TypeScript, and Tailwind CSS.
