# Authentication Integration Guide

This document explains how we integrated the Next.js 14 server actions for authentication with the existing authentication mechanism in the LED-UP frontend.

## Overview of Changes

1. Created a new client-side hook `useServerAuth` that uses the server actions
2. Updated the `AuthProvider` to use the new hook instead of the old `useDidAuth` hook
3. Updated the `DidAuth` component to handle async logout and loading states
4. Added proper error handling and loading states throughout the authentication flow

## Key Files Modified

1. **New Files**:

   - `led-up-fe/hooks/use-server-auth.ts`: New hook that uses server actions
   - `led-up-fe/auth/README.md`: Documentation for the new authentication system
   - `led-up-fe/auth/INTEGRATION.md`: This integration guide

2. **Modified Files**:
   - `led-up-fe/context/auth-provider.tsx`: Updated to use the new hook
   - `led-up-fe/components/did-auth.tsx`: Updated to handle async logout

## Implementation Details

### 1. The `useServerAuth` Hook

The new `useServerAuth` hook replaces the old `useDidAuth` hook and provides the same interface but uses the new server actions. Key differences:

- Uses server actions for authentication instead of direct API calls
- Handles authentication tokens via HTTP-only cookies (managed by server actions)
- Provides the same interface as the old hook for backward compatibility

### 2. The `AuthProvider` Update

The `AuthProvider` was updated to use the new `useServerAuth` hook instead of `useDidAuth`. Changes include:

- Updated imports to use the new hook
- Updated the interface to match the new hook's return type
- Made the `logout` function async to match the new implementation

### 3. The `DidAuth` Component Update

The `DidAuth` component was updated to handle the async nature of the new logout function:

- Added loading state for logout
- Made the logout handler async
- Added error handling for logout
- Updated the UI to show loading state during logout

## Authentication Flow

The authentication flow remains the same:

1. User connects their wallet
2. User clicks "Authenticate with DID"
3. System gets or creates a DID for the user's address
4. System generates a challenge for the user to sign
5. User signs the challenge with their wallet
6. System verifies the signature and authenticates the user
7. Authentication tokens are stored in HTTP-only cookies

## Benefits of the New Implementation

1. **Security**: Tokens are stored in HTTP-only cookies, which are not accessible to JavaScript, preventing XSS attacks
2. **Performance**: Server actions are optimized for Next.js 14 and provide better performance
3. **Type Safety**: The new implementation is fully typed with TypeScript
4. **Maintainability**: The code is more modular and follows Next.js 14 best practices
5. **Error Handling**: Improved error handling with custom error classes

## Potential Issues and Solutions

1. **Issue**: Server actions require Next.js 14 or later
   **Solution**: Ensure the project is using Next.js 14 or later

2. **Issue**: Server actions are not supported in older browsers
   **Solution**: Add appropriate polyfills or fallbacks for older browsers

3. **Issue**: HTTP-only cookies require HTTPS in production
   **Solution**: Ensure the application is served over HTTPS in production

## Testing

To test the new authentication implementation:

1. Connect your wallet
2. Click "Authenticate with DID"
3. Verify that you are authenticated successfully
4. Click "Logout" and verify that you are logged out
5. Disconnect your wallet and verify that the authentication state is reset

## Future Improvements

1. Add more comprehensive error handling
2. Implement automatic token refresh
3. Add support for multiple wallet types
4. Improve the user experience during authentication
5. Add more comprehensive testing
