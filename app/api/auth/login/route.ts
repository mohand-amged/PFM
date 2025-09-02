import { NextResponse } from 'next/server';
import { login } from '@/lib/auth-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const result = await login(email, password);

    if (!result) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      user: result.user,
    });

    // Set HTTP-only cookie with the token
    response.cookies.set({
      name: 'auth-token',
      value: result.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    // Log error in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('Login error:', error);
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
