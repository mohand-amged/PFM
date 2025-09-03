import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { verifyPassword, createToken } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(request: NextRequest) {
  try {
    console.log('=== LOGIN TEST STARTED ===');
    
    // Step 1: Check environment variables
    console.log('Step 1: Checking environment variables...');
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL not set');
      return NextResponse.json({ error: 'DATABASE_URL not set' }, { status: 500 });
    }
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not set');
      return NextResponse.json({ error: 'JWT_SECRET not set' }, { status: 500 });
    }
    console.log('Environment variables OK');
    
    // Step 2: Parse request
    console.log('Step 2: Parsing request...');
    const body = await request.json();
    console.log('Request body received:', { email: body.email, hasPassword: !!body.password });
    
    // Step 3: Validate data
    console.log('Step 3: Validating data...');
    const { email, password } = loginSchema.parse(body);
    console.log('Validation passed for email:', email);
    
    // Step 4: Test database connection
    console.log('Step 4: Testing database connection...');
    try {
      await prisma.$connect();
      console.log('Database connection successful');
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed', details: dbError instanceof Error ? dbError.message : 'Unknown error' },
        { status: 503 }
      );
    }
    
    // Step 5: Find user
    console.log('Step 5: Looking for user...');
    const user = await prisma.user.findUnique({
      where: { email },
    });
    console.log('User found:', !!user);
    
    if (!user) {
      console.log('User not found in database');
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    console.log('User details:', { id: user.id, email: user.email, name: user.name });
    
    // Step 6: Verify password
    console.log('Step 6: Verifying password...');
    const isPasswordValid = await verifyPassword(password, user.password);
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('Password verification failed');
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Step 7: Create token
    console.log('Step 7: Creating JWT token...');
    const token = await createToken({
      id: user.id,
      email: user.email,
      name: user.name || undefined,
    });
    console.log('Token created successfully');
    
    // Step 8: Create response
    console.log('Step 8: Creating response...');
    const response = NextResponse.json(
      {
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 200 }
    );
    
    // Step 9: Set cookie
    console.log('Step 9: Setting cookie...');
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/'
    });
    console.log('Cookie set successfully');
    
    console.log('=== LOGIN TEST COMPLETED SUCCESSFULLY ===');
    return response;
    
  } catch (error) {
    console.error('=== LOGIN TEST FAILED ===');
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    if (error instanceof z.ZodError) {
      console.error('Validation error details:', error.errors);
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    // Handle database connection errors
    if (error instanceof Error && error.message.includes('connect')) {
      console.error('Database connection error detected');
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 503 }
      );
    }

    console.error('Unexpected error occurred');
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        type: error?.constructor?.name || 'Unknown'
      },
      { status: 500 }
    );
  }
}
