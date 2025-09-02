/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize for production
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-icons'],
  },
  // Ensure CSS is properly handled in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Performance optimizations
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  // Webpack configuration to handle Edge Runtime
  webpack: (config, { isServer, isEdgeRuntime }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'bcryptjs': 'commonjs bcryptjs',
        'jsonwebtoken': 'commonjs jsonwebtoken',
        'jws': 'commonjs jws',
      });
    }
    
    // For Edge Runtime, exclude Node.js modules
    if (isEdgeRuntime) {
      config.externals = config.externals || [];
      config.externals.push({
        'bcryptjs': 'commonjs bcryptjs',
        'jsonwebtoken': 'commonjs jsonwebtoken',
        'jws': 'commonjs jws',
        '@prisma/client': 'commonjs @prisma/client',
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
