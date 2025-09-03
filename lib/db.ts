import { PrismaClient } from '@prisma/client';
import { env } from './env';

declare global {
  var prisma: PrismaClient | undefined;
}

// Create Prisma client with production optimizations
const prisma = global.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: env.DATABASE_URL,
    },
  },
  log: env.NODE_ENV === 'development' ? ['error', 'warn', 'info'] : ['error'],
  // Production optimizations
  ...(env.NODE_ENV === 'production' && {
    errorFormat: 'minimal',
  }),
});

// Configure connection with error handling
if (env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Enhanced connection test with retry logic
async function testConnection(retries = 3): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$connect();
      console.log('✅ Database connection successful');
      return true;
    } catch (error) {
      console.error(`❌ Database connection attempt ${i + 1} failed:`, error instanceof Error ? error.message : 'Unknown error');
      
      if (i === retries - 1) {
        console.error('💡 Database connection troubleshooting:');
        console.error('   1. Check MongoDB Atlas cluster is running');
        console.error('   2. Verify DATABASE_URL is correct');
        console.error('   3. Ensure IP whitelist includes Vercel IPs (0.0.0.0/0)');
        console.error('   4. Check database user permissions');
        console.error('   5. Verify network connectivity');
        return false;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  return false;
}

// Test connection on startup
testConnection().catch(() => {
  // Connection will be tested on first use
});

// Export with connection helper
export default prisma;
export { testConnection };
