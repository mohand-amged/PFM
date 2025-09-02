import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth-service';

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
      const user = await verifyToken(token);
      if (!user) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
      
      // Add user to request headers for API routes to access
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', user.id);
      if (user.email) {
        requestHeaders.set('x-user-email', user.email);
      }
      if (user.name) {
        requestHeaders.set('x-user-name', user.name);
      }

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

  // If user is authenticated, add user data to request headers
  if (token) {
    const user = await verifyToken(token);
    if (user) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', user.id);
      if (user.email) {
        requestHeaders.set('x-user-email', user.email);
      }
      if (user.name) {
        requestHeaders.set('x-user-name', user.name);
      }

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
