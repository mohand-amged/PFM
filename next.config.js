/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Enable type checking during build
    ignoreBuildErrors: false,
  },
  eslint: {
    // Run ESLint during build
    ignoreDuringBuilds: false,
  },
  // Optimize for production
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-icons'],
  },
  // Performance optimizations
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  // Webpack configuration to suppress Edge Runtime warnings
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'bcryptjs': 'commonjs bcryptjs',
        'jsonwebtoken': 'commonjs jsonwebtoken',
        'jws': 'commonjs jws',
      });
    }
    return config;
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
