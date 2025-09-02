import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
};

export default nextConfig;
