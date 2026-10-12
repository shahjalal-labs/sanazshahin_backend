module.exports = {
  apps: [
    {
      name: "main-server",
      script: "./dist/server.js",
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    }    
  ],
};
