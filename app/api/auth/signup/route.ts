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
    console.log('Signup request started');
    
    // Check database connection
    await prisma.$connect();
    console.log('Database connected successfully');
    
    const body = await request.json();
    console.log('Request body parsed');
    
    const { email, password, name } = signupSchema.parse(body);
    console.log('Validation passed for email:', email);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      );
    }

    // Hash password
    console.log('Hashing password...');
    const hashedPassword = await hashPassword(password);
    console.log('Password hashed successfully');

    // Create user
    console.log('Creating user...');
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });
    console.log('User created with ID:', user.id);

    // Create token
    console.log('Creating JWT token...');
    const token = await createToken({
      id: user.id,
      email: user.email,
      name: user.name || undefined,
    });
    console.log('Token created successfully');

    // Create response and set cookie
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

    // Set cookie directly on response
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/'
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    // Handle database connection errors
    if (error instanceof Error && error.message.includes('connect')) {
      console.error('Database connection error:', error);
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 503 }
      );
    }

    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
