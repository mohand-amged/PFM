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
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Configure connection with error handling
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Test connection on startup
prisma.$connect().catch((error) => {
  if (process.env.NODE_ENV === 'development') {
    console.error('Database connection failed:', error);
  }
});

export default prisma;
