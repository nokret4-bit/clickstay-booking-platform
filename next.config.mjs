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
  // Add comprehensive security headers for anti-clickjacking and XSS protection
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent clickjacking attacks - don't allow page to be framed
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Enable XSS protection in older browsers
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Referrer policy for privacy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Content Security Policy - Mitigates XSS and data injection attacks
          // Declares approved sources of content that browsers are allowed to load
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'", // Only allow content from same origin by default
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Scripts from self (unsafe-inline needed for Next.js)
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // Styles from self and Google Fonts
              "img-src 'self' data: https: blob:", // Images from self, data URIs, HTTPS, and blob URLs
              "font-src 'self' data: https://fonts.gstatic.com", // Fonts from self, data URIs, and Google Fonts
              "connect-src 'self' https:", // API/WebSocket connections only to self and HTTPS
              "frame-ancestors 'none'", // Don't allow framing (also set X-Frame-Options)
              "object-src 'none'", // Disable plugins (Flash, Java, etc.)
              "base-uri 'self'", // Only allow same-origin base URLs
              "form-action 'self'", // Forms can only submit to same origin
              "upgrade-insecure-requests", // Upgrade HTTP to HTTPS automatically
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
