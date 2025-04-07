# LED-UP Smart Contract API Authentication System

This document provides an overview of the authentication system implemented for the LED-UP Smart Contract API.

## Overview

The authentication system is built using JWT (JSON Web Tokens) and Ethereum signatures. It provides the following features:

- Challenge-based authentication using Ethereum signatures
- Role-based access control
- Token refresh mechanism
- DID (Decentralized Identifier) integration

## Authentication Flow

1. **Challenge Generation**

   - Client requests a challenge by sending their Ethereum address
   - Server generates a random challenge and stores it with an expiration time
   - Client receives the challenge and its expiration time

2. **Authentication**

   - Client signs the challenge with their Ethereum private key
   - Client sends the signature and address to the server
   - Server verifies the signature and challenge
   - If valid, server generates access and refresh tokens
   - Client receives the tokens and user information

3. **Token Usage**
   - Client includes the access token in the Authorization header for subsequent requests
   - Server verifies the token and checks the user's role for protected endpoints
   - If the token is expired, client uses the refresh token to get new tokens

## API Endpoints

### Generate Challenge

```
POST /auth/challenge
```

Request:

```json
{
  "address": "0x1234567890abcdef1234567890abcdef12345678"
}
```

Response:

```json
{
  "challenge": "Sign this message to authenticate with LED-UP: 1234567890abcdef",
  "expiresAt": 1612345678900
}
```

### Authenticate

```
POST /auth/authenticate
```

Request:

```json
{
  "address": "0x1234567890abcdef1234567890abcdef12345678",
  "signature": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1b"
}
```

Response:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "user": {
    "address": "0x1234567890abcdef1234567890abcdef12345678",
    "role": "consumer",
    "did": "did:ethr:0x1234567890abcdef1234567890abcdef12345678"
  }
}
```

### Verify Token

```
POST /auth/verify
```

Request:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Response:

```json
{
  "valid": true,
  "payload": {
    "sub": "0x1234567890abcdef1234567890abcdef12345678",
    "role": "consumer",
    "did": "did:ethr:0x1234567890abcdef1234567890abcdef12345678",
    "iat": 1612345678,
    "exp": 1612349278
  }
}
```

### Refresh Token

```
POST /auth/refresh
```

Request:

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Response:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "user": {
    "address": "0x1234567890abcdef1234567890abcdef12345678",
    "role": "consumer",
    "did": "did:ethr:0x1234567890abcdef1234567890abcdef12345678"
  }
}
```

### Get DID for Address

```
POST /auth/did
```

Request:

```json
{
  "address": "0x1234567890abcdef1234567890abcdef12345678"
}
```

Response:

```json
{
  "did": "did:ethr:0x1234567890abcdef1234567890abcdef12345678",
  "active": true
}
```

### Check DID Active

```
POST /auth/did/active
```

Request:

```json
{
  "did": "did:ethr:0x1234567890abcdef1234567890abcdef12345678"
}
```

Response:

```json
{
  "active": true
}
```

## Authentication Middleware

The authentication middleware is used to protect endpoints that require authentication. It checks the Authorization header for a valid JWT token and verifies the user's role if required.

Example usage:

```typescript
import { authMiddleware } from '../helpers/auth-middleware';
import { UserRole } from '../types/auth-types';

// Check authentication
const authError = authMiddleware(request, [UserRole.ADMIN]);
if (authError) {
  return authError;
}

// Continue with the endpoint logic
```

## Configuration

The authentication system requires the following environment variables:

- `JWT_SECRET`: Secret key for signing JWT tokens
- `JWT_REFRESH_SECRET`: Secret key for signing refresh tokens

These should be set in the `local.settings.json` file for local development and in the Azure Function App settings for production.

## Security Considerations

- JWT secrets should be at least 32 characters long and should be kept secret
- In production, the challenge store should be replaced with a persistent store like Azure Table Storage
- All communication should be over HTTPS
- Token expiration times should be set appropriately based on security requirements
- Refresh tokens should be rotated on use to prevent token reuse
- Consider implementing rate limiting to prevent brute force attacks
