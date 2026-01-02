module.exports = {
    apps: [{
      name: 'gusto-wolt-reporter',
      script: './server.js',
      cwd: '/opt/GustoWoltReporter',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        NODE_OPTIONS: '--dns-result-order=ipv4first'
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      merge_logs: true
    }]
  };