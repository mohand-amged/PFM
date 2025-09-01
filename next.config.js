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
  // Ensure environment variables are available on the client side if needed
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
  // Handle Prisma in the browser
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ensure Prisma client is generated during build
      require('./scripts/generate-prisma')
    }
    return config
  },
}

module.exports = nextConfig
