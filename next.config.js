/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
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
  webpack: (config, { isServer, isEdgeRuntime, webpack }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'bcryptjs': 'commonjs bcryptjs',
        'jsonwebtoken': 'commonjs jsonwebtoken',
        'jws': 'commonjs jws',
      });
    }
    
    // For Edge Runtime, aggressively exclude Node.js modules
    if (isEdgeRuntime) {
      config.externals = config.externals || [];
      config.externals.push({
        'bcryptjs': 'commonjs bcryptjs',
        'jsonwebtoken': 'commonjs jsonwebtoken',
        'jws': 'commonjs jws',
        '@prisma/client': 'commonjs @prisma/client',
        'prisma': 'commonjs prisma',
        'fs': 'commonjs fs',
        'path': 'commonjs path',
        'crypto': 'commonjs crypto',
        'util': 'commonjs util',
        'stream': 'commonjs stream',
        'buffer': 'commonjs buffer',
        'events': 'commonjs events',
        'os': 'commonjs os',
        'child_process': 'commonjs child_process',
      });
      
      // Also add resolve fallbacks for Edge Runtime
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'bcryptjs': false,
        'jsonwebtoken': false,
        'jws': false,
        '@prisma/client': false,
        'prisma': false,
        'fs': false,
        'path': false,
        'crypto': false,
        'util': false,
        'stream': false,
        'buffer': false,
        'events': false,
        'os': false,
        'child_process': false,
      };
      
      // Add plugin to ignore Node.js modules in Edge Runtime
      config.plugins = config.plugins || [];
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^(bcryptjs|jsonwebtoken|jws|@prisma\/client|prisma)$/,
        })
      );
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
