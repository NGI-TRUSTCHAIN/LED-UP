import * as sql from 'mssql';

import { AuthChallenge, AuthChallengeInput } from '../../models';
import { DatabaseService } from '../db';

/**
 * Service for managing authentication challenges
 * This service provides methods for creating, retrieving, and updating challenges
 */
export class AuthChallengeService {
  private databaseService: DatabaseService;

  /**
   * Create a new authentication challenge service
   * @param databaseService The database service instance
   */
  constructor(databaseService: DatabaseService = new DatabaseService()) {
    this.databaseService = databaseService;
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    try {
      await this.databaseService.initialize();

      // Try to setup the database tables (ensure they exist)
      // This is a best-effort operation; we'll continue even if it fails
      try {
        await this.databaseService.setupDatabase();
      } catch (error) {
        console.warn('Error setting up database tables:', error.message);
        // Continue despite table setup errors
      }
    } catch (error) {
      console.error('Failed to initialize AuthChallengeService:', error.message);
      // We'll let this error propagate since database connection is essential
      throw error;
    }
  }

  /**
   * Create a new authentication challenge for a wallet address
   * @param address The Ethereum address to create the challenge for
   * @param nonce The nonce to use for the challenge
   * @param message The challenge message
   * @param ipAddress Optional IP address of the requesting client
   * @param userAgent Optional user agent of the requesting client
   * @returns The created authentication challenge
   */
  async createChallenge(
    address: string,
    nonce: string,
    message: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthChallenge> {
    // Set expiration to 15 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    const challengeInput: AuthChallengeInput = {
      address,
      nonce,
      message,
      expiresAt,
      ipAddress,
      userAgent,
    };

    return await this.databaseService.createAuthChallenge(challengeInput);
  }

  /**
   * Get the active challenge for an address
   * @param address The Ethereum address to get the challenge for
   * @returns The active challenge or null if none exists
   */
  async getActiveChallenge(address: string): Promise<AuthChallenge | null> {
    return await this.databaseService.getActiveAuthChallengeForAddress(address);
  }

  /**
   * Get a challenge by its ID
   * @param id The ID of the challenge to retrieve
   * @returns The challenge or null if not found
   */
  async getChallengeById(id: string): Promise<AuthChallenge | null> {
    return await this.databaseService.getAuthChallengeById(id);
  }

  /**
   * Mark a challenge as used (consumed)
   * @param challengeId The ID of the challenge to mark as used
   * @returns True if the challenge was marked as used, false otherwise
   */
  async markAsUsed(challengeId: string): Promise<boolean> {
    return await this.databaseService.markAuthChallengeAsUsed(challengeId);
  }

  /**
   * Delete all expired challenges
   * @returns The number of challenges deleted
   */
  async cleanupExpiredChallenges(): Promise<number> {
    return await this.databaseService.deleteExpiredAuthChallenges();
  }

  /**
   * Close the service and release resources
   */
  async close(): Promise<void> {
    await this.databaseService.close();
  }

  /**
   * Create a new authentication challenge for a wallet address with transaction support
   * @param address The Ethereum address to create the challenge for
   * @param nonce The nonce to use for the challenge
   * @param message The challenge message
   * @param ipAddress Optional IP address of the requesting client
   * @param userAgent Optional user agent of the requesting client
   * @param transaction Optional transaction for atomic operations
   * @returns The created authentication challenge
   */
  async createChallengeWithTransaction(
    address: string,
    nonce: string,
    message: string,
    ipAddress?: string,
    userAgent?: string,
    transaction?: sql.Transaction
  ): Promise<AuthChallenge> {
    // Set expiration to 15 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    const challengeInput: AuthChallengeInput = {
      address,
      nonce,
      message,
      expiresAt,
      ipAddress,
      userAgent,
    };

    return await this.databaseService.createAuthChallengeWithTransaction(
      challengeInput,
      transaction
    );
  }

  /**
   * Mark a challenge as used (consumed) with transaction support
   * @param challengeId The ID of the challenge to mark as used
   * @param transaction Optional transaction for atomic operations
   * @returns True if the challenge was marked as used, false otherwise
   */
  async markAsUsedWithTransaction(
    challengeId: string,
    transaction?: sql.Transaction
  ): Promise<boolean> {
    return await this.databaseService.markAuthChallengeAsUsedWithTransaction(
      challengeId,
      transaction
    );
  }

  /**
   * Create a transaction for atomic operations
   * @returns A new SQL transaction
   */
  async createTransaction(): Promise<sql.Transaction> {
    return await this.databaseService.getTransaction();
  }

  /**
   * Commit a transaction
   * @param transaction The transaction to commit
   */
  async commitTransaction(transaction: sql.Transaction): Promise<void> {
    await transaction.commit();
  }

  /**
   * Rollback a transaction
   * @param transaction The transaction to rollback
   */
  async rollbackTransaction(transaction: sql.Transaction): Promise<void> {
    await transaction.rollback();
  }

  /**
   * Check if an identifier is rate-limited
   * @param identifier The identifier (address or IP) to check
   * @param type The type of identifier (ADDRESS or IP)
   * @returns Information about the rate limit status
   */
  async checkRateLimit(
    identifier: string,
    type: 'ADDRESS' | 'IP'
  ): Promise<{
    isBlocked: boolean;
    blockedUntil?: Date;
    attemptCount: number;
  }> {
    try {
      return await this.databaseService.checkRateLimit(identifier, type);
    } catch (error) {
      // Log the error but don't let it block authentication
      console.error(`Rate limit check error for ${type} ${identifier}:`, error.message);

      // Default to allowing access if the database operation fails
      return {
        isBlocked: false,
        attemptCount: 0,
      };
    }
  }

  /**
   * Record an authentication attempt for rate limiting purposes
   * @param identifier The identifier (address or IP) to record the attempt for
   * @param type The type of identifier (ADDRESS or IP)
   * @returns Information about the rate limit status
   */
  async recordAuthAttempt(
    identifier: string,
    type: 'ADDRESS' | 'IP'
  ): Promise<{
    attemptCount: number;
    isBlocked: boolean;
    blockedUntil?: Date;
  }> {
    try {
      return await this.databaseService.recordAuthAttempt(identifier, type);
    } catch (error) {
      // Log the error but don't let it block authentication
      console.error(`Failed to record auth attempt for ${type} ${identifier}:`, error.message);

      // Return default values that allow continuing
      return {
        attemptCount: 0,
        isBlocked: false,
      };
    }
  }

  /**
   * Clear rate limiting for a specific identifier
   * This is primarily for development/testing purposes
   * @param identifier The identifier (address or IP) to clear rate limiting for
   * @param type The type of identifier (ADDRESS or IP)
   * @returns Number of records cleared
   */
  async clearRateLimiting(identifier: string, type: 'ADDRESS' | 'IP'): Promise<number> {
    try {
      return await this.databaseService.clearRateLimitingForIdentifier(identifier, type);
    } catch (error) {
      console.error(`Failed to clear rate limiting for ${type} ${identifier}:`, error.message);
      return 0;
    }
  }
}
