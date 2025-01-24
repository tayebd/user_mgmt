/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        port: "",
        pathname: "/**",
      }
    ]
  },
  experimental: {
    turbo: {
      rules: {
        // Configure any Turbopack-specific rules
      }
    }
  }
};

export default nextConfig;
