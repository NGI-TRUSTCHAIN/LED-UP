# Authentication Services

The LEDUP platform provides a robust authentication and identity management framework based on Decentralized Identifiers (DIDs) and blockchain technology. This documentation covers the authentication services, including API endpoints, libraries, and implementation details.

## Contents

### API Endpoints

- [Authentication API Reference](./AuthFunctions.md): Comprehensive documentation for all authentication-related API endpoints implemented as Azure Functions, including authentication flows, DID management, and token handling.

### Core Services

- [AuthService](./AuthService.md): The main authentication service that coordinates between DID authentication, registry services, and token generation.
- [JWTService](./JWTService.md): Service for issuing and validating JSON Web Tokens (JWTs) for secure authentication.
- [AuthChallengeService](./AuthChallengeService.md): Service for generating, storing, and validating authentication challenges.

### DID Services

- [DidRegistryService](./DidRegistryService.md): Service for interacting with the on-chain DID Registry.
- [DidResolverService](./DidResolverService.md): Service for resolving DIDs into DID Documents.
- [DidVerifierService](./DidVerifierService.md): Service for verifying signatures and permissions related to DIDs.
- [DidAuthService](./DidAuthService.md): Service for authenticating users based on their DIDs.

### Security Services

- [KeyVaultService](./KeyVaultService.md): Service for securely storing and retrieving cryptographic keys.
- [CredentialService](./CredentialService.md): Service for issuing and verifying Verifiable Credentials.

## Authentication Flow

The authentication flow in the LEDUP platform follows these steps:

1. Client requests a challenge by providing an Ethereum address
2. Server generates a challenge and returns it with an expiration timestamp
3. Client signs the challenge with their private key
4. Client sends the signature and address to the server
5. Server verifies the signature and validates the DID
6. Server issues JWT tokens (access token and refresh token)
7. Client uses the access token for subsequent API calls
8. Client refreshes the access token using the refresh token when it expires

For a more detailed visualization, refer to the [Authentication API Reference](./AuthFunctions.md).

## DID Management

Decentralized Identifiers (DIDs) are the foundation of identity in the LEDUP platform. DIDs can be:

1. Created and registered on the blockchain
2. Retrieved and resolved into DID Documents
3. Updated with new verification methods or services
4. Deactivated to prevent further use

The DID format used is `did:ethr:<ethereum-address>`, which provides a direct link between Ethereum addresses and DIDs.

## Integration Examples

For integration examples with various frameworks and environments, see the [Authentication API Reference](./AuthFunctions.md#integration-examples).

## Security Considerations

Authentication services in the LEDUP platform follow best security practices:

- Rate limiting for authentication attempts
- Token refresh mechanisms with sliding expiration
- Secure key storage using Azure Key Vault
- Role-based access control for DID operations
- Blockchain-based verification for DIDs

For more details on security practices, see the [Authentication API Reference](./AuthFunctions.md#security-considerations).

---

© 2025 LEDUP | Documentation for Production Use | Last Updated: March 2025
