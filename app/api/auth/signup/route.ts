import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma, { testConnection } from '@/lib/db';
import { hashPassword, createToken } from '@/lib/auth';
import { env } from '@/lib/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Validation schema
const signupSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required').optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Environment variables are validated at startup via lib/env.ts
    console.log('Signup request started');

    // Parse and validate request body
    const body = await request.json();
    const { email, password, name } = signupSchema.parse(body);

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

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name?.trim() || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    // Create JWT token
    const token = await createToken({
      id: user.id,
      email: user.email,
      name: user.name || undefined,
    });

    // Create response
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
    console.error('Signup error:', error);

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
      
      if (error.message.includes('unique') || error.message.includes('duplicate')) {
        return NextResponse.json(
          { error: 'User already exists with this email' },
          { status: 409 }
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
