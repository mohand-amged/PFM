import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma, { testConnection } from '@/lib/db';
import { verifyPassword, createToken } from '@/lib/auth';
import { env } from '@/lib/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    // Environment variables are validated at startup via lib/env.ts
    console.log('Login request started');

    // Parse and validate request body
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // Test database connection with retry
    const dbConnected = await testConnection();
    if (!dbConnected) {
      return NextResponse.json(
        { 
          error: 'Database connection failed',
          details: 'Please check your database configuration and try again'
        },
        { status: 503 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        createdAt: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = await createToken({
      id: user.id,
      email: user.email,
      name: user.name || undefined,
    });

    // Create response
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

    // Set authentication cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    // Handle database errors
    if (error instanceof Error) {
      if (error.message.includes('connect') || error.message.includes('timeout')) {
        return NextResponse.json(
          { error: 'Database connection failed. Please try again later.' },
          { status: 503 }
        );
      }
    }

    // Generic server error
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
