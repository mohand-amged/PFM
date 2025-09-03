import { NextRequest, NextResponse } from 'next/server';
import { env, isProduction } from '@/lib/env';
import { testConnection } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Check environment variables
    const envCheck = {
      DATABASE_URL: !!env.DATABASE_URL,
      JWT_SECRET: !!env.JWT_SECRET,
      NODE_ENV: env.NODE_ENV,
    };

    // Test database connection
    const dbConnected = await testConnection(1);
    
    const responseTime = Date.now() - startTime;

    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      responseTime: `${responseTime}ms`,
      checks: {
        environment: envCheck,
        database: {
          connected: dbConnected,
          status: dbConnected ? 'healthy' : 'unhealthy'
        }
      },
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
    };

    // Determine overall health status
    const isHealthy = envCheck.DATABASE_URL && envCheck.JWT_SECRET && dbConnected;
    const statusCode = isHealthy ? 200 : 503;

    if (!isHealthy) {
      healthStatus.status = 'unhealthy';
    }

    return NextResponse.json(healthStatus, { status: statusCode });

  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        checks: {
          environment: {
            DATABASE_URL: !!process.env.DATABASE_URL,
            JWT_SECRET: !!process.env.JWT_SECRET,
            NODE_ENV: process.env.NODE_ENV,
          },
          database: {
            connected: false,
            status: 'error'
          }
        }
      },
      { status: 503 }
    );
  }
}
