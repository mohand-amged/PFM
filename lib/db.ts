import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

// Configure connection with error handling
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Test connection on startup with better error handling
prisma.$connect().catch((error) => {
  console.error('❌ Database connection failed:');
  console.error('📋 Error details:', error.message);
  console.error('💡 Please check:');
  console.error('   1. MongoDB Atlas cluster is running');
  console.error('   2. DATABASE_URL in .env is correct');
  console.error('   3. Network connectivity to MongoDB Atlas');
  console.error('   4. Database user credentials are valid');
});

export default prisma;
