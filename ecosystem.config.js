module.exports = {
  apps : [{
    name: 'hyperian',
    script: 'build-hyperion/main.js',
    instances: 1,
    autorestart: true,
    watch: true,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  },
  {  
    name: 'api',
    script: 'build-api/main.js',
    watch: true,
    autorestart:true	
  }]
};
