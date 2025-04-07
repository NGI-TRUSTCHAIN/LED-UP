import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/about',
  '/api/auth/challenge',
  '/api/auth/authenticate',
  '/api/auth/refresh',
  '/auth/login',
  '/auth/signin',
  '/auth/signup',
  '/auth/refresh',
  '/auth/register',
  '/did-viem-registry',
  '/sample-reg',
  '/doctor-dashboard',
  '/kanban',
  '/circom',
];

// Define API routes that should bypass the middleware
const apiRoutes = ['/api/auth'];

// Define routes that handle server actions
const serverActionRoutes = ['/auth/actions/refreshAndRedirect'];

// Define static asset routes that should bypass the middleware
const staticRoutes = ['/_next', '/favicon.ico', '/images', '/fonts'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is public, an API route, a server action route, or a static asset
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  const isApiRoute = apiRoutes.some((route) => pathname.startsWith(route));

  const isServerActionRoute = serverActionRoutes.some((route) => pathname.startsWith(route));

  const isStaticRoute = staticRoutes.some((route) => pathname.startsWith(route));

  // Allow public routes, API routes, server action routes, and static assets to bypass authentication check
  if (isPublicRoute || isApiRoute || isServerActionRoute || isStaticRoute) {
    return NextResponse.next();
  }

  // Check for auth token in cookies
  const authToken = request.cookies.get('auth_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;

  // If no token is found, redirect to login
  if (!authToken) {
    // If we have a refresh token, redirect to a page that will use the server action
    if (refreshToken) {
      // Create a URL for the refresh page
      const refreshUrl = new URL('/auth/refresh', request.url);
      // Add the original URL as a query parameter to redirect after refresh
      refreshUrl.searchParams.set('redirect', pathname);

      // Add cache control headers to prevent caching
      const response = NextResponse.redirect(refreshUrl);
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');

      return response;
    }

    // No tokens available, redirect to login
    const loginUrl = new URL('/auth/signin', request.url);

    // Add the original URL as a query parameter to redirect after login
    loginUrl.searchParams.set('redirect', pathname);

    // Add cache control headers to prevent caching
    const response = NextResponse.redirect(loginUrl);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  }

  // Token exists, but we don't validate it here for performance reasons
  // The server-side validation happens in the API routes
  // The client-side validation happens in the useServerAuth hook

  // Add cache control headers to prevent caching of authenticated pages
  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  return response;
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Match all routes except static files, api routes we want to bypass, and _next
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
