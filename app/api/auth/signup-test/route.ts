import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { hashPassword, createToken } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required').optional(),
});

export async function POST(request: NextRequest) {
  try {
    console.log('=== SIGNUP TEST STARTED ===');
    
    // Step 1: Parse request
    console.log('Step 1: Parsing request...');
    const body = await request.json();
    console.log('Request body received:', { email: body.email, hasPassword: !!body.password, name: body.name });
    
    // Step 2: Validate data
    console.log('Step 2: Validating data...');
    const { email, password, name } = signupSchema.parse(body);
    console.log('Validation passed for email:', email);
    
    // Step 3: Test database connection
    console.log('Step 3: Testing database connection...');
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
    
    // Step 4: Check if user exists
    console.log('Step 4: Checking if user exists...');
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    console.log('User exists check completed, found:', !!existingUser);
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      );
    }
    
    // Step 5: Hash password
    console.log('Step 5: Hashing password...');
    const hashedPassword = await hashPassword(password);
    console.log('Password hashed successfully');
    
    // Step 6: Create user
    console.log('Step 6: Creating user...');
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });
    console.log('User created successfully with ID:', user.id);
    
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
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
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
    
    console.log('=== SIGNUP TEST COMPLETED SUCCESSFULLY ===');
    return response;
    
  } catch (error) {
    console.error('=== SIGNUP TEST FAILED ===');
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
