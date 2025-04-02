# LED-UP Authentication System

This directory contains the authentication system for the LED-UP platform, built with Next.js 14 server actions.

## Overview

The authentication system provides a secure way to authenticate users using their Ethereum wallet and DID (Decentralized Identifier). It uses a challenge-response mechanism to verify ownership of the wallet address and manages authentication tokens securely using HTTP-only cookies.

## Architecture

The authentication system is built using Next.js 14 server actions, which provide a secure way to execute server-side code from client components. The system consists of:

1. **Server Actions**: Functions that run on the server to handle authentication requests
2. **Utility Functions**: Helper functions for token management, error handling, etc.
3. **Types**: TypeScript types for authentication-related data
4. **Configuration**: API endpoints and other configuration

## Server Actions

The following server actions are available:

### Authentication Actions

- `generateChallenge`: Generates a challenge for the user to sign
- `authenticate`: Authenticates a user with their wallet address and signature
- `refreshToken`: Refreshes the authentication token
- `verifyToken`: Verifies if the current token is valid
- `logout`: Logs out the user by clearing authentication tokens

### DID Actions

- `createDid`: Creates a new DID for a wallet address
- `getDidDocument`: Gets the DID document for a DID
- `updateDidDocument`: Updates a DID document
- `deactivateDid`: Deactivates a DID
- `getDidForAddress`: Gets the DID associated with a wallet address
- `checkDidActive`: Checks if a DID is active
- `resolveDid`: Resolves a DID to its DID document
- `updatePublicKey`: Updates the public key for a DID

## Client Integration

To use the authentication system in your client components:

1. Import the server actions from the `@/auth` module
2. Use the `useServerAuth` hook to manage authentication state
3. Use the `AuthProvider` to provide authentication context to your components

### Example: Using the `useServerAuth` Hook

```tsx
'use client';

import { useServerAuth } from '@/hooks/use-server-auth';

export function MyComponent() {
  const { isAuthenticated, isLoading, login, logout } = useServerAuth();

  return (
    <div>
      {isAuthenticated ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <button onClick={login} disabled={isLoading}>
          Login
        </button>
      )}
    </div>
  );
}
```

### Example: Using the `AuthProvider`

```tsx
// app/layout.tsx
import { AuthProvider } from '@/context/auth-provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

### Example: Using the `useAuth` Hook

```tsx
'use client';

import { useAuth } from '@/context/auth-provider';

export function MyComponent() {
  const { isAuthenticated, did, login, logout } = useAuth();

  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Authenticated as: {did}</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={login}>Login</button>
      )}
    </div>
  );
}
```

## Protected Routes

To protect routes that require authentication, you can use the `requireAuth` utility function in your page components:

```tsx
// app/protected/page.tsx
import { requireAuth } from '@/auth';

export default function ProtectedPage() {
  // This will redirect to /auth/login if the user is not authenticated
  requireAuth();

  return (
    <div>
      <h1>Protected Page</h1>
      <p>This page is only accessible to authenticated users.</p>
    </div>
  );
}
```

## Error Handling

The authentication system includes a custom `ApiError` class for handling API errors. You can catch these errors in your components and display appropriate error messages to the user.

```tsx
try {
  await login();
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`Authentication error (${error.status}): ${error.message}`);
  } else {
    console.error('Unknown error:', error);
  }
}
```

## Security Considerations

- Authentication tokens are stored in HTTP-only cookies to prevent XSS attacks
- Refresh tokens are used to obtain new access tokens without requiring the user to re-authenticate
- All server actions use CSRF protection provided by Next.js
- Challenge-response authentication prevents replay attacks
