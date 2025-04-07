/**
 * Authentication middleware for Azure Functions.
 */
import { HttpRequest, HttpResponseInit } from '@azure/functions';

import { UserRole } from '../types/auth-types';
import { verifyAccessToken } from '../utils';

/**
 * Authentication middleware for Azure Functions
 *
 * @param request - The HTTP request
 * @param requiredRoles - The roles required to access the endpoint (optional)
 * @returns An error response if authentication fails, null otherwise
 */
export function authMiddleware(
  request: HttpRequest,
  requiredRoles?: UserRole[]
): HttpResponseInit | null {
  // Get the authorization header
  const authHeader = request.headers.get('authorization');

  // Check if the authorization header exists
  if (!authHeader) {
    return {
      status: 401,
      jsonBody: {
        error: 'Unauthorized',
        message: 'Missing authorization header',
      },
    };
  }

  // Check if the authorization header is in the correct format
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return {
      status: 401,
      jsonBody: {
        error: 'Unauthorized',
        message: 'Invalid authorization header format',
      },
    };
  }

  // Get the token
  const token = parts[1];

  // Verify the token
  const payload = verifyAccessToken(token);
  if (!payload) {
    return {
      status: 401,
      jsonBody: {
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      },
    };
  }

  // Check if the user has the required role
  if (requiredRoles && requiredRoles.length > 0) {
    if (!requiredRoles.includes(payload.role)) {
      return {
        status: 403,
        jsonBody: {
          error: 'Forbidden',
          message: 'Insufficient permissions',
        },
      };
    }
  }

  // Authentication successful
  return null;
}

/**
 * Get the user from the request
 *
 * @param request - The HTTP request
 * @returns The user if authenticated, null otherwise
 */
export function getUser(
  request: HttpRequest
): { address: string; role: UserRole; did: string } | null {
  // Get the authorization header
  const authHeader = request.headers.get('authorization');

  // Check if the authorization header exists
  if (!authHeader) {
    return null;
  }

  // Check if the authorization header is in the correct format
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  // Get the token
  const token = parts[1];

  // Verify the token
  const payload = verifyAccessToken(token);
  if (!payload) {
    return null;
  }

  // Return the user
  return {
    address: payload.sub,
    role: payload.role,
    did: payload.did,
  };
}
