module.exports = {
  apps: [{
    name: 'sanguo-server',
    script: './node_modules/.bin/strapi',
    args: 'develop',
    cwd: '/Volumes/990ProMacOS/Users/pengcl/Documents/Companies/Pinor/San/server',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 1337,
      DATABASE_HOST: 'localhost',
      DATABASE_PORT: 3306,
      DATABASE_NAME: 'sanguo',
      DATABASE_USERNAME: 'root',
      DATABASE_PASSWORD: 'Pengcl19821025@@'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    // 忽略特定错误重启
    ignore_watch: ['node_modules', 'logs'],
    // 设置最大重启次数
    max_restarts: 10,
    // 设置最小运行时间
    min_uptime: '10s',
    // 监听文件变化（开发环境）
    watch_options: {
      followSymlinks: false,
      usePolling: true,
      interval: 1000
    }
  }]
};