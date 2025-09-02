import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30; // Increase timeout to 30 seconds

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Input validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists with timeout
    const existingUser = await Promise.race([
      prisma.user.findUnique({
        where: { email },
      }),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 10000)
      )
    ]);

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password with reduced salt rounds for better performance
    const hashedPassword = await bcrypt.hash(password, 8);

    // Create user with timeout
    const user = await Promise.race([
      prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      }),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 10000)
      )
    ]);

    // Remove password from response - user is guaranteed to be a User object here
    const { password: _, ...userWithoutPassword } = user as Exclude<typeof user, never>;

    return NextResponse.json(
      { user: userWithoutPassword, message: 'User created successfully' },
      { status: 201 }
    );
  } catch (error) {
    // Log error in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('Signup error:', error);
    }
    
    // Handle specific timeout errors
    if (error instanceof Error && error.message === 'Database timeout') {
      return NextResponse.json(
        { error: 'Request timeout. Please try again.' },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
