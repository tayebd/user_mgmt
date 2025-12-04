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
  // Static export configuration for Netlify deployment
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  images: {
    unoptimized: true
  },
  // Environment variables for client-side access
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  // Note: rewrites and headers are handled by netlify.toml for static export
};

module.exports = nextConfig;
