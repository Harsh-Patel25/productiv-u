module.exports = {
  apps: [{
    name: 'productiv-u',
    script: 'npx',
    args: 'serve -s dist -l tcp://0.0.0.0:8080 --cors',
    cwd: __dirname,
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s',
    env: {
      NODE_ENV: 'production',
      HOST: '0.0.0.0',
      PORT: 8080
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Performance monitoring
    monitoring: {
      http: true,
      https: false,
      port: 9615
    },
    
    // Health check
    health_check: {
      url: 'http://localhost:8080',
      interval: 30000,
      timeout: 5000
    }
  }],
  
  // Deployment configuration
  deploy: {
    production: {
      user: 'node',
      host: 'localhost',
      ref: 'origin/main',
      repo: 'git@github.com:user/productivity-app.git',
      path: '/var/www/productivity-app',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
