module.exports = {
  apps: [
    {
      name: "project-management",
      script: "pnpm",
      args: "run dev",
      env: {
        NODE_ENV: "development",
      },
    },
  ],
};
