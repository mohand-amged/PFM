import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Use Node.js runtime for compatibility with bcryptjs and jsonwebtoken
export const runtime = 'nodejs';

// Inline JWT verification function to avoid any import issues
function verifyTokenEdge(token: string): { userId: string } | null {
  try {
    // Split the JWT token
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (middle part)
    const payload = parts[1];
    // Add padding if needed
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    
    // Decode base64
    const decodedPayload = atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'));
    const parsedPayload = JSON.parse(decodedPayload);
    
    // Check if token is expired
    if (parsedPayload.exp && parsedPayload.exp < Date.now() / 1000) {
      return null;
    }
    
    return { userId: parsedPayload.userId };
  } catch (error) {
    return null;
  }
}

const publicPaths = ['/login', '/signup'];
const authPaths = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token')?.value;

  // Check if the current path is an auth path (login/register)
  const isAuthPath = authPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // For API routes
  if (pathname.startsWith('/api/')) {
    // Allow all API routes (auth is now optional)
    if (pathname.startsWith('/api/auth/')) {
      return NextResponse.next();
    }

    // For other API routes, add user info if token exists but don't require it
    if (token) {
      const payload = verifyTokenEdge(token);
      if (payload) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', payload.userId);

        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      }
    }

    // Allow unauthenticated access to API routes
    return NextResponse.next();
  }

  // For page routes - redirect authenticated users away from auth pages
  if (isAuthPath) {
    if (token) {
      // If user is logged in and tries to access auth pages, redirect to home
      const homeUrl = new URL('/', request.url);
      return NextResponse.redirect(homeUrl);
    }
    return NextResponse.next();
  }

  // Allow all other routes without authentication requirement
  // If user is authenticated, add user ID to request headers
  if (token) {
    const payload = verifyTokenEdge(token);
    if (payload) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
