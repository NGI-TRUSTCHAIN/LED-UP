import * as jwt from 'jsonwebtoken';

/**
 * Service for handling JWT tokens for authentication and authorization
 */
export class JWTService {
  private readonly secret: string;
  private readonly defaultExpiration: string;

  /**
   * Initialize the JWT service
   *
   * @param secretKey Secret key used to sign tokens (should be stored in environment variables in production)
   * @param defaultExpiration Default token expiration time (e.g., '1h', '7d')
   */
  constructor(
    secretKey: string = process.env.JWT_SECRET || 'temporary-secret-key-for-development',
    defaultExpiration: string = '1h'
  ) {
    this.secret = secretKey;
    this.defaultExpiration = defaultExpiration;
  }

  /**
   * Generate a JWT token
   *
   * @param payload Data to include in the token
   * @param expiresIn Token expiration time (e.g., '15m', '1h')
   * @returns The generated JWT token
   */
  generateToken(payload: Record<string, any>, expiresIn?: string): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: expiresIn || this.defaultExpiration,
    } as jwt.SignOptions);
  }

  /**
   * Verify a JWT token
   *
   * @param token Token to verify
   * @returns Decoded token payload if valid
   * @throws Error if token is invalid or expired
   */
  verifyToken<T = any>(token: string): T {
    try {
      return jwt.verify(token, this.secret) as T;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
      throw error;
    }
  }

  /**
   * Generate a short-lived access token for specific data
   *
   * @param walletAddress User's wallet address
   * @param dataId ID of the data being accessed
   * @param expiresIn Token expiration time (default: 15 minutes)
   * @returns Access token for the specified data
   */
  generateAccessToken(walletAddress: string, dataId: string, expiresIn: string = '15m'): string {
    return this.generateToken(
      {
        walletAddress,
        dataId,
        purpose: 'data-access',
        iat: Math.floor(Date.now() / 1000),
      },
      expiresIn
    );
  }

  /**
   * Extract authorization token from request headers
   *
   * @param authHeader Authorization header value
   * @returns The token or null if not found
   */
  extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7); // Remove 'Bearer ' prefix
  }

  /**
   * Decode a token without verifying its signature
   * Useful for debugging or getting token metadata
   *
   * @param token JWT token to decode
   * @returns Decoded token payload
   */
  decodeToken<T = any>(token: string): T | null {
    try {
      return jwt.decode(token) as T;
    } catch (error) {
      return null;
    }
  }
}
