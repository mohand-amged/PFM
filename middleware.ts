import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Explicitly set Edge Runtime
export const runtime = 'edge';

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

  // Check if the current path is public
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // Check if the current path is an auth path (login/register)
  const isAuthPath = authPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // For API routes
  if (pathname.startsWith('/api/')) {
    // Allow public API routes
    if (pathname.startsWith('/api/auth/')) {
      return NextResponse.next();
    }

    // Verify token for protected API routes
    if (token) {
      const payload = verifyTokenEdge(token);
      if (!payload) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
      
      // Add user ID to request headers for API routes to access
      // The API routes will need to fetch full user data from the database
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // For page routes
  if (isAuthPath) {
    if (token) {
      // If user is logged in and tries to access auth pages, redirect to home
      const homeUrl = new URL('/', request.url);
      return NextResponse.redirect(homeUrl);
    }
    return NextResponse.next();
  }

  // Redirect to login if not authenticated and not a public path
  if (!token && !isPublicPath) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

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
