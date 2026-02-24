/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Increase chunk loading timeout
    config.output = {
      ...config.output,
      chunkLoadTimeout: 120000, // 2 minutes instead of default 2 seconds
    };
    return config;
  },
  // Disable static optimization for problematic pages
  experimental: {
    optimizePackageImports: ['lucide-react', '@/components/ui'],
  },
};

export default nextConfig;
