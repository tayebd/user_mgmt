/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configure SWC to handle JSX and TypeScript
  compiler: {
    // Enable TypeScript features
    emotion: false,
    styledComponents: false,
  },
  // Server external packages configuration
  serverExternalPackages: [],
};

module.exports = nextConfig;
