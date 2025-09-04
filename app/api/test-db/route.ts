import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...');
    
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'DATABASE_URL environment variable is not set',
          details: 'Please set DATABASE_URL in your Vercel environment variables'
        },
        { status: 500 }
      );
    }

    console.log('DATABASE_URL found, testing connection...');
    
    // Test connection with MongoDB driver directly
    const client = new MongoClient(databaseUrl);
    
    try {
      await client.connect();
      console.log('✅ Direct MongoDB connection successful');
      
      // Test a simple operation
      const db = client.db();
      const collections = await db.listCollections().toArray();
      
      await client.close();
      
      return NextResponse.json(
        {
          status: 'success',
          message: 'Database connection successful',
          details: {
            connectionString: databaseUrl.replace(/\/\/.*@/, '//***:***@'), // Hide credentials
            collectionsCount: collections.length,
            collections: collections.map(c => c.name)
          }
        },
        { status: 200 }
      );
      
    } catch (connectionError) {
      console.error('❌ Direct MongoDB connection failed:', connectionError);
      
      return NextResponse.json(
        {
          status: 'error',
          message: 'Database connection failed',
          details: {
            error: connectionError instanceof Error ? connectionError.message : 'Unknown error',
            connectionString: databaseUrl.replace(/\/\/.*@/, '//***:***@'), // Hide credentials
            troubleshooting: [
              'Check if MongoDB Atlas cluster is running',
              'Verify Network Access includes 0.0.0.0/0',
              'Check database user credentials',
              'Ensure connection string format is correct'
            ]
          }
        },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Test database endpoint error:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        message: 'Test endpoint failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
