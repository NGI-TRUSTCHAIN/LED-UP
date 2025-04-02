# Auth Service

**Component Type:** Service  
**Path:** `/services/auth/AuthService.ts`

## Overview

The Auth Service is the core component responsible for managing authentication in the LEDUP system. It handles challenge-based authentication, signature verification, DID management, and JWT token handling to create a secure authentication framework.

```mermaid
flowchart TB
    subgraph Clients
        Web["Web Application"]
        Mobile["Mobile App"]
        API["API Clients"]
    end

    subgraph "Auth Service"
        AS["Auth Service Core"]
        ASChallenge["Challenge Generation"]
        ASVerify["Signature Verification"]
        ASToken["Token Management"]
        ASRole["Role Determination"]
        ASRequest["Request Authentication"]

        AS --> ASChallenge
        AS --> ASVerify
        AS --> ASToken
        AS --> ASRole
        AS --> ASRequest
    end

    subgraph "External Services"
        JWT["JWT Service"]
        ACS["Auth Challenge Service"]
        DVS["DID Verifier Service"]
        DRS["DID Registry Service"]
        DRS_Contract["DID Registry Contract"]
    end

    subgraph "Data Storage"
        Blockchain["Ethereum Blockchain"]
    end

    Web --> AS
    Mobile --> AS
    API --> AS

    ASChallenge --> ACS
    ASVerify --> DVS
    ASToken --> JWT
    ASRole --> DRS
    ASRequest --> JWT

    DRS --> DRS_Contract
    DRS_Contract --> Blockchain

    style AS fill:#f9f,stroke:#333,stroke-width:2px
    style JWT fill:#bbf,stroke:#333,stroke-width:1px
    style ACS fill:#bbf,stroke:#333,stroke-width:1px
    style DVS fill:#bbf,stroke:#333,stroke-width:1px
    style DRS fill:#bbf,stroke:#333,stroke-width:1px
```

```mermaid
flowchart TB
    subgraph "Client Layer"
        WebApp["Web Application"]
        MobileApp["Mobile Application"]
        ExternalAPI["External API Clients"]
    end

    subgraph "Auth Service Core"
        Auth["Auth Service Core"]
        Challenge["Challenge Management"]
        Verification["Identity Verification"]
        TokenMgmt["Token Management"]
        RoleResolver["Role Resolution"]
        RequestAuth["Request Authentication"]
        DidMgmt["DID Management"]
    end

    subgraph "Service Dependencies"
        JWT["JWT Service"]
        AuthChallenge["Auth Challenge Service"]
        DidVerifier["DID Verifier Service"]
        DidRegistry["DID Registry Service"]
        KeyVault["Key Vault Service"]
    end

    subgraph "Blockchain Layer"
        SmartContract["DID Registry Contract"]
        BlockchainNode["Ethereum Node"]
    end

    WebApp --> Auth
    MobileApp --> Auth
    ExternalAPI --> Auth

    Auth --> Challenge
    Auth --> Verification
    Auth --> TokenMgmt
    Auth --> RoleResolver
    Auth --> RequestAuth
    Auth --> DidMgmt

    Challenge --> AuthChallenge
    Verification --> DidVerifier
    TokenMgmt --> JWT
    RoleResolver --> DidRegistry
    DidMgmt --> DidRegistry

    DidVerifier --> KeyVault
    DidRegistry --> SmartContract
    SmartContract --> BlockchainNode

    style Auth fill:#f9f,stroke:#333,stroke-width:2px
    style JWT fill:#bbf,stroke:#333,stroke-width:1px
    style AuthChallenge fill:#bbf,stroke:#333,stroke-width:1px
    style DidVerifier fill:#bbf,stroke:#333,stroke-width:1px
    style DidRegistry fill:#bbf,stroke:#333,stroke-width:1px
    style SmartContract fill:#dfd,stroke:#333,stroke-width:1px
```

## Dependencies

The service relies on several other services:

- **DidAuthService**: Handles DID authentication against the blockchain
- **DidRegistryService**: Manages DID registration and retrieval from the blockchain
- **DidVerifierService**: Verifies DID-related signatures
- **JWTService**: Handles JWT token generation and verification

## Methods

### generateAuthChallenge

Generates a challenge for authentication.

```typescript
public generateAuthChallenge(address: string): { challenge: string; expiresAt: number }
```

**Parameters:**

- `address`: The Ethereum address to generate a challenge for

**Returns:**

- Object containing:
  - `challenge`: The generated challenge string
  - `expiresAt`: Timestamp when the challenge expires

**Example Usage:**

```typescript
const { challenge, expiresAt } = authService.generateAuthChallenge('0x1234567890abcdef1234567890abcdef12345678');

console.log(`Challenge: ${challenge}`);
console.log(`Expires at: ${new Date(expiresAt).toLocaleString()}`);
```

### authenticate

Authenticates a user using their Ethereum address and signature.

```typescript
public async authenticate(address: string, signature: string): Promise<AuthResponse>
```

**Parameters:**

- `address`: The user's Ethereum address
- `signature`: The signature of the challenge

**Returns:**

- `Promise<AuthResponse>`: Authentication response containing:
  - `accessToken`: JWT access token
  - `refreshToken`: JWT refresh token
  - `expiresIn`: Token expiration time in seconds
  - `user`: Object containing user information (address, role, DID)

**Error Handling:**

- Throws error if challenge is invalid
- Throws error if signature is invalid
- Throws error if DID is deactivated

**Example Flow:**

1. Gets the challenge for this address
2. Verifies the signature against the challenge
3. Retrieves the DID for the address if available
4. Determines the user's role based on the DID
5. Generates JWT tokens
6. Returns authentication response

### verifyToken

Verifies a JWT token.

```typescript
public verifyToken(token: string): TokenPayload | null
```

**Parameters:**

- `token`: The JWT token to verify

**Returns:**

- `TokenPayload | null`: The decoded token payload if valid, null otherwise

### refreshToken

Refreshes a JWT access token using a refresh token.

```typescript
public async refreshToken(refreshToken: string): Promise<Omit<AuthResponse, 'user'> & { user?: AuthResponse['user'] }>
```

**Parameters:**

- `refreshToken`: The refresh token to use

**Returns:**

- Promise resolving to a partial AuthResponse with new tokens

**Security Considerations:**

- Validates the refresh token
- Retrieves the user information
- Generates new tokens
- Returns new tokens and optionally the user information

### isDidActive

Checks if a DID is active.

```typescript
public async isDidActive(did: string): Promise<boolean>
```

**Parameters:**

- `did`: The DID to check

**Returns:**

- `Promise<boolean>`: True if the DID is active, false otherwise

### getDidForAddress

Retrieves the DID for an Ethereum address.

```typescript
public async getDidForAddress(address: string): Promise<any>
```

**Parameters:**

- `address`: The Ethereum address

**Returns:**

- `Promise<any>`: The DID document for the address

### logout

Logs out a user by invalidating their token.

```typescript
public async logout(address: string, token: string): Promise<boolean>
```

**Parameters:**

- `address`: The user's Ethereum address
- `token`: The JWT token to invalidate

**Returns:**

- `Promise<boolean>`: True if logout was successful, false otherwise

### authenticateRequest

Authenticates an HTTP request using JWT token from headers.

```typescript
public authenticateRequest(request: HttpRequest, requiredRoles?: UserRole[]): HttpResponseInit | null
```

**Parameters:**

- `request`: The HTTP request to authenticate
- `requiredRoles`: Optional array of roles required for access

**Returns:**

- `HttpResponseInit | null`: Error response if authentication fails, null if successful

**Security Flow:**

1. Extracts the token from the Authorization header
2. Verifies the token
3. Checks if the user has the required roles if specified
4. Returns appropriate error response or null if successful

### getUserFromRequest

Extracts user information from an HTTP request.

```typescript
public getUserFromRequest(request: HttpRequest): { address: string; role: UserRole; did: string } | null
```

**Parameters:**

- `request`: The HTTP request

**Returns:**

- User information object if authenticated, null otherwise

## Authentication Flow

The complete authentication flow is illustrated below:

```mermaid
sequenceDiagram
    participant Client
    participant AuthAPI
    participant AuthService
    participant DidRegistry
    participant JWT

    Client->>AuthAPI: Request Challenge (address)
    AuthAPI->>AuthService: generateAuthChallenge(address)
    AuthService-->>AuthAPI: {challenge, expiresAt}
    AuthAPI-->>Client: {challenge, expiresAt}

    Note over Client: User signs challenge with private key

    Client->>AuthAPI: Authenticate (address, signature)
    AuthAPI->>AuthService: authenticate(address, signature)
    AuthService->>AuthService: verifySignature(address, signature, challenge)
    AuthService->>DidRegistry: getDidForAddress(address)
    DidRegistry-->>AuthService: DID Document (if available)
    AuthService->>AuthService: determineUserRole(did)
    AuthService->>JWT: generateTokens(address, role, did)
    JWT-->>AuthService: {accessToken, refreshToken, expiresIn}
    AuthService-->>AuthAPI: {tokens, user info}
    AuthAPI-->>Client: {tokens, user info}

    Note over Client: User stores tokens securely

    Client->>AuthAPI: Protected API Request (with accessToken)
    AuthAPI->>AuthService: authenticateRequest(request)
    AuthService->>JWT: verifyToken(token)
    JWT-->>AuthService: TokenPayload or null
    AuthService-->>AuthAPI: Authentication Result

    alt Token Valid
        AuthAPI-->>Client: Protected Resource
    else Token Invalid
        AuthAPI-->>Client: 401 Unauthorized
    end
```

## Error Handling

The AuthService handles various error conditions:

| Error Code                 | Description                     | HTTP Status | Handling Strategy                      |
| -------------------------- | ------------------------------- | ----------- | -------------------------------------- |
| `INVALID_CHALLENGE`        | Challenge not found or expired  | 401         | Request a new challenge                |
| `INVALID_SIGNATURE`        | Signature verification failed   | 401         | Ensure correct private key is used     |
| `DEACTIVATED_USER`         | User's DID is deactivated       | 403         | Contact administrator for reactivation |
| `INVALID_TOKEN`            | JWT token is invalid or expired | 401         | Refresh token or authenticate again    |
| `INSUFFICIENT_PERMISSIONS` | User lacks required role        | 403         | Request necessary permissions          |

## Security Considerations

1. **Challenge Expiration**: Challenges expire after a short period (typically 15 minutes)
2. **Signature Verification**: Uses both on-chain and local verification methods
3. **Role-Based Access Control**: Enforces access based on user roles
4. **Token Management**: Short-lived access tokens with refresh capability
5. **Token Blacklisting**: Invalidates tokens on logout

## Integration Examples

### Authentication Request Flow

```typescript
// 1. Request a challenge
const challengeResponse = await fetch(
  'https://api.ledup.io/auth/challenge?address=0x1234567890abcdef1234567890abcdef12345678'
);
const { challenge } = await challengeResponse.json();

// 2. Sign the challenge with the user's private key
const signature = await wallet.signMessage(challenge);

// 3. Authenticate with the signature
const authResponse = await fetch('https://api.ledup.io/auth/authenticate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ address: '0x1234567890abcdef1234567890abcdef12345678', signature }),
});

const { accessToken, refreshToken, user } = await authResponse.json();

// 4. Use the access token for subsequent requests
const protectedResponse = await fetch('https://api.ledup.io/protected-resource', {
  headers: { Authorization: `Bearer ${accessToken}` },
});
```

## Complete Authentication Flow

The Auth Service orchestrates the entire authentication process from challenge generation to token issuance:

```mermaid
sequenceDiagram
    participant Client
    participant AuthService
    participant AuthChallenge
    participant DidVerifier
    participant DidRegistry
    participant JWTService
    participant Blockchain

    Client->>AuthService: Request challenge (address)
    AuthService->>AuthChallenge: generateChallenge(address)
    AuthChallenge-->>AuthService: Challenge object
    AuthService-->>Client: Challenge text & expiry

    Note over Client: Sign challenge with private key

    Client->>AuthService: authenticate(address, signature)
    AuthService->>AuthChallenge: validateChallenge(address, challenge)
    AuthChallenge-->>AuthService: isValid

    alt Challenge Valid
        AuthService->>DidVerifier: verifySignature(address, challenge, signature)
        DidVerifier-->>AuthService: isValid

        alt Signature Valid
            AuthService->>DidRegistry: getDidForAddress(address)
            DidRegistry->>Blockchain: Query DID data
            Blockchain-->>DidRegistry: DID information
            DidRegistry-->>AuthService: DID document

            AuthService->>DidRegistry: isDidActive(did)
            DidRegistry-->>AuthService: isActive

            AuthService->>AuthService: determineUserRole(did)

            AuthService->>JWTService: generateTokens(address, role, did)
            JWTService-->>AuthService: {accessToken, refreshToken, expiresIn}

            AuthService->>AuthChallenge: invalidateChallenge(address)

            AuthService-->>Client: {accessToken, refreshToken, expiresIn, user: {address, role, did}}
        else Signature Invalid
            AuthService-->>Client: Error: Invalid signature
        end
    else Challenge Invalid
        AuthService-->>Client: Error: Invalid challenge
    end
```
