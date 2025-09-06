// PM2 Configuration for ProductivU
// This keeps the app running permanently, even after PC restarts

module.exports = {
  apps: [{
    name: 'ProductivU',
    script: 'server.cjs',
    cwd: process.cwd(),
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true
  }],

  deploy: {
    production: {
      user: 'node',
      host: '192.168.213.22',
      ref: 'origin/master',
      repo: 'git@github.com:username/productivity-app.git',
      path: '/var/www/productivity-app',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production'
    }
  }
};
