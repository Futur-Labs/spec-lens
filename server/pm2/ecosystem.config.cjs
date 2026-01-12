module.exports = {
  apps: [
    {
      name: 'spec-lens',
      script: './server/index.mjs',
      instances: '1',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        DATABASE_URL: 'file:./server/specLens.db',
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      wait_ready: true,
    },
  ],
};
