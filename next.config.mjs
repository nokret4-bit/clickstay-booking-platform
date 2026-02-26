/** @type {import('next').NextConfig} */
const nextConfig = {
  generateBuildId: async () => {
    // Force new build ID to invalidate all caches
    return `build-${Date.now()}`;
  },
  typedRoutes: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
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
