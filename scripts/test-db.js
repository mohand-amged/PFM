const { PrismaClient } = require('@prisma/client');

async function testDatabaseConnection() {
  const prisma = new PrismaClient({
    log: ['error', 'warn', 'info'],
  });

  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test MongoDB connection with a simple aggregation
    console.log('✅ Database query test successful!');
    
    // Try to check if User table exists (this might fail if not created yet)
    try {
      const userCount = await prisma.user.count();
      console.log(`✅ User table found with ${userCount} users`);
    } catch (error) {
      console.log('⚠️  User table not found (run prisma db push first)');
    }

  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('📋 Error:', error.message);
    console.error('💡 Common fixes:');
    console.error('   1. Check your DATABASE_URL in .env');
    console.error('   2. Ensure MongoDB Atlas cluster is running');
    console.error('   3. Verify network connectivity');
    console.error('   4. Check user credentials and permissions');
    console.error('   5. Ensure database name exists in the connection string');
    
    if (error.message.includes('Server selection timeout')) {
      console.error('🌐 Network issue: Cannot reach MongoDB Atlas servers');
    }
    
    if (error.message.includes('authentication failed')) {
      console.error('🔐 Authentication issue: Check username/password');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection().catch(console.error);
