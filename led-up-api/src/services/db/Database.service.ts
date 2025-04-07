import * as sql from 'mssql';
import { v4 as uuidv4 } from 'uuid';

import { AuthChallenge, AuthChallengeInput } from '../../models/authChallenge';
import { IPFSLookupInput, IPFSLookup } from '../../models/ipfsLookup';
import { RefreshToken, RefreshTokenInput } from '../../models/refreshToken';

/**
 * Configuration options for the database service
 */
export interface DatabaseConfig {
  server: string;
  port: number;
  user: string;
  password: string;
  database: string;
  options?: {
    encrypt?: boolean;
    trustServerCertificate?: boolean;
  };
}

/**
 * Database service for managing data persistence
 * Uses SQL Server as the backend
 */
export class DatabaseService {
  private pool: sql.ConnectionPool | null = null;
  private poolPromise: Promise<sql.ConnectionPool> | null = null;
  private config: DatabaseConfig;
  private initialized = false;

  /**
   * Create a new database service instance
   * Configuration is read from environment variables if not provided
   * @param config Optional database configuration to override environment variables
   */
  constructor(config?: Partial<DatabaseConfig>) {
    // Use environment variables by default, allowing override with passed config
    this.config = {
      server: config?.server || process.env.DB_SERVER1 || 'localhost',
      port: config?.port || parseInt(process.env.DB_PORT1 || '1433'),
      user: config?.user || process.env.DB_USER1 || 'sa',
      password: config?.password || process.env.DB_PASSWORD1 || 'DataSharing_P@ssw0rd',
      database: config?.database || process.env.DB_DATABASE1 || 'DataSharing',
      options: {
        encrypt: config?.options?.encrypt ?? false,
        trustServerCertificate: config?.options?.trustServerCertificate ?? true,
      },
    };
  }

  /**
   * Initialize the database connection pool
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      this.poolPromise = new sql.ConnectionPool({
        server: this.config.server,
        port: this.config.port,
        user: this.config.user,
        password: this.config.password,
        database: this.config.database,
        options: {
          encrypt: this.config.options?.encrypt ?? false,
          trustServerCertificate: this.config.options?.trustServerCertificate ?? true,
        },
      }).connect();

      this.pool = await this.poolPromise;
      this.initialized = true;

      console.log('Database connection initialized successfully');
    } catch (error) {
      console.error('Error initializing database connection:', error);
      throw error;
    }
  }

  /**
   * Ensure the database connection is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Get the connection pool
   */
  private async getPool(): Promise<sql.ConnectionPool> {
    await this.ensureInitialized();

    if (!this.pool) {
      throw new Error('Database connection pool is not initialized');
    }

    return this.pool;
  }

  /**
   * Create the necessary database tables if they don't exist
   */
  async setupDatabase(): Promise<void> {
    const pool = await this.getPool();

    // Create AuthChallenges table if it doesn't exist
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AuthChallenges')
      BEGIN
        CREATE TABLE AuthChallenges (
          Id NVARCHAR(50) PRIMARY KEY,
          Address NVARCHAR(50) NOT NULL,
          Nonce NVARCHAR(100) NOT NULL,
          Message NVARCHAR(500) NOT NULL,
          IssuedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
          ExpiresAt DATETIME2 NOT NULL,
          Used BIT NOT NULL DEFAULT 0,
          UsedAt DATETIME2 NULL,
          IpAddress NVARCHAR(50) NULL,
          UserAgent NVARCHAR(500) NULL,
          INDEX IX_AuthChallenges_Address (Address),
          INDEX IX_AuthChallenges_ExpiresAt (ExpiresAt)
        )
      END
    `);

    // Create AuthRateLimits table if it doesn't exist
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AuthRateLimits')
      BEGIN
        CREATE TABLE AuthRateLimits (
          Id NVARCHAR(50) PRIMARY KEY,
          Identifier NVARCHAR(100) NOT NULL,
          Type NVARCHAR(20) NOT NULL, -- ADDRESS or IP
          AttemptCount INT NOT NULL DEFAULT 1,
          FirstAttemptAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
          LastAttemptAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
          BlockedUntil DATETIME2 NULL,
          INDEX IX_AuthRateLimits_Identifier (Identifier),
          INDEX IX_AuthRateLimits_LastAttemptAt (LastAttemptAt)
        )
      END
    `);

    // Create RefreshTokens table if it doesn't exist
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'RefreshTokens')
      BEGIN
        CREATE TABLE RefreshTokens (
          Id NVARCHAR(50) PRIMARY KEY,
          UserAddress NVARCHAR(50) NOT NULL,
          Token NVARCHAR(100) NOT NULL,
          IssuedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
          ExpiresAt DATETIME2 NOT NULL,
          Used BIT NOT NULL DEFAULT 0,
          UsedAt DATETIME2 NULL,
          Revoked BIT NOT NULL DEFAULT 0,
          RevokedAt DATETIME2 NULL,
          ReplacedByTokenId NVARCHAR(50) NULL,
          IpAddress NVARCHAR(50) NULL,
          UserAgent NVARCHAR(500) NULL,
          INDEX IX_RefreshTokens_UserAddress (UserAddress),
          INDEX IX_RefreshTokens_Token (Token),
          INDEX IX_RefreshTokens_ExpiresAt (ExpiresAt)
        )
      END
    `);

    // Create IPFSLookups table if it doesn't exist
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'IPFSLookups')
      BEGIN
        CREATE TABLE IPFSLookups (
          -- Primary Key
          Id NVARCHAR(50) PRIMARY KEY,
          
          -- IPFS content identifier
          cid NVARCHAR(100) NOT NULL,

          -- owner DID

          -- keyvault name - for symmetric key encryption
          keyvaultName NVARCHAR(500) NOT NULL,
          
          -- Timestamp when the entry was created
          createdAt BIGINT NOT NULL,
          
          -- System Fields
          UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
          DeletedAt DATETIME2 NULL,
          
          -- Indexes
          INDEX IX_IPFSLookups_cid (cid),
          INDEX IX_IPFSLookups_ownerDid (ownerDid)
        );
      END
    `);

    // Create stored procedure for inserting new IPFS lookup
    await pool.request().query(`
      IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'CreateIPFSLookup')
      BEGIN
        DROP PROCEDURE CreateIPFSLookup;
      END
    `);

    await pool.request().query(`
      CREATE PROCEDURE CreateIPFSLookup
        @Id NVARCHAR(50),
        @cid NVARCHAR(100),
        @keyvaultName NVARCHAR(500),
        @createdAt BIGINT,
        @ownerDid NVARCHAR(100)
      AS
      BEGIN
        SET NOCOUNT ON;
        
        INSERT INTO IPFSLookups (
          Id, cid, keyvaultName, createdAt, ownerDid
        )
        VALUES (
          @Id, @cid, @keyvaultName, @createdAt, @ownerDid
        );
        
        SELECT @Id AS Id;
      END
    `);

    // Create a procedure to get lookup information
    await pool.request().query(`
      IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'GetIPFSLookup')
      BEGIN
        DROP PROCEDURE GetIPFSLookup;
      END

      CREATE PROCEDURE GetIPFSLookup
        @cid NVARCHAR(100)
      AS
      BEGIN
        SET NOCOUNT ON;
        
        SELECT 
          Id, 
          cid, 
          keyvaultName, 
          createdAt,
          ownerDid
        FROM IPFSLookups 
        WHERE cid = @cid
          AND DeletedAt IS NULL;
      END
    `);
  }

  /**
   * Create a new IPFS lookup record
   * @param ipfsLookup The IPFS lookup data to create
   * @returns The created IPFS lookup with ID
   */
  async createIPFSLookup(ipfsLookup: IPFSLookupInput): Promise<IPFSLookup> {
    const pool = await this.getPool();
    const id = uuidv4();

    await pool
      .request()
      .input('id', sql.NVarChar, id)
      .input('cid', sql.NVarChar, ipfsLookup.cid)
      .input('keyvaultName', sql.NVarChar, ipfsLookup.keyvaultName)
      .input('createdAt', sql.BigInt, ipfsLookup.createdAt)
      .input('ownerDid', sql.NVarChar, ipfsLookup.ownerDid).query(`
        INSERT INTO IPFSLookups (Id, cid, keyvaultName, createdAt, ownerDid)
      `);

    return { id, ...ipfsLookup };
  }

  /**
   * Get an IPFS lookup record by ID
   * @param id The ID of the IPFS lookup to retrieve
   * @param cid The CID of the IPFS lookup to retrieve
   * @param ownerDid The owner DID of the IPFS lookup to retrieve
   * @returns The IPFS lookup or null if not found
   */
  async getIPFSLookup({
    id,
    cid,
    ownerDid,
  }: {
    id?: string;
    cid?: string;
    ownerDid?: string;
  }): Promise<IPFSLookup | null> {
    const pool = await this.getPool();
    const request = await pool.request();

    if (!id && !cid && !ownerDid) {
      throw new Error('At least one of id, cid, or ownerDid must be provided');
    }

    let query = 'SELECT * FROM IPFSLookups';

    if (id) {
      query += ' WHERE Id = @id';
      request.input('id', sql.NVarChar, id);
    }

    if (cid) {
      query += ' WHERE cid = @cid';
      request.input('cid', sql.NVarChar, cid);
    }

    if (ownerDid) {
      query += ' WHERE ownerDid = @ownerDid';
      request.input('ownerDid', sql.NVarChar, ownerDid);
    }

    const result = await request.query<IPFSLookup>(query);

    return result.recordset.length > 0 ? result.recordset[0] : null;
  }

  /**
   * get all IPFS lookup records
   * @param ownerDid The owner DID of the IPFS lookups to retrieve
   * @returns all IPFS lookup records for the given owner DID
   */
  async getAllIPFSLookups(ownerDid: string): Promise<IPFSLookup[]> {
    const pool = await this.getPool();

    const result = await pool.request().input('ownerDid', sql.NVarChar, ownerDid)
      .query<IPFSLookup>(`
      SELECT * FROM IPFSLookups WHERE ownerDid = @ownerDid
    `);

    return result.recordset;
  }

  /**
   * Create a new IPFS lookup record
   * @param ipfsLookup The IPFS lookup data to create
   * @returns The created IPFS lookup with ID
   */
  async updateIPFSLookup(ipfsLookup: IPFSLookupInput): Promise<IPFSLookup> {
    const pool = await this.getPool();
    const id = ipfsLookup.id;
    if (!id) {
      throw new Error('IPFS lookup ID is required');
    }

    await pool
      .request()
      .input('id', sql.NVarChar, id)
      .input('cid', sql.NVarChar, ipfsLookup.cid)
      .input('keyvaultName', sql.NVarChar, ipfsLookup.keyvaultName)
      .input('updatedAt', sql.BigInt, ipfsLookup.updatedAt).query(`
        UPDATE IPFSLookups
        SET cid = @cid, keyvaultName = @keyvaultName, updatedAt = @updatedAt
        WHERE Id = @id
      `);

    return { id, ...ipfsLookup };
  }

  /**
   * Delete an IPFS lookup record by ID
   * @param id The ID of the IPFS lookup to delete
   * @returns True if the IPFS lookup was deleted, false otherwise
   */
  async deleteIPFSLookup(id: string): Promise<boolean> {
    const pool = await this.getPool();

    const result = await pool
      .request()
      .input('id', sql.NVarChar, id)
      .input('deletedAt', sql.BigInt, new Date().getTime()).query(`
        UPDATE IPFSLookups
        SET DeletedAt = @deletedAt
        WHERE Id = @id
      `);

    return result.rowsAffected[0] > 0;
  }

  /**
   * Get a new transaction for atomic operations
   * @returns A SQL transaction object
   */
  async getTransaction(): Promise<sql.Transaction> {
    const pool = await this.getPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    return transaction;
  }

  /**
   * Create a new authentication challenge with transaction support
   * @param challenge The challenge details to create
   * @param transaction Optional transaction for atomic operations
   * @returns The created challenge
   */
  async createAuthChallengeWithTransaction(
    challenge: AuthChallengeInput,
    transaction?: sql.Transaction
  ): Promise<AuthChallenge> {
    const id = uuidv4();
    const now = new Date();

    try {
      const request = transaction ? new sql.Request(transaction) : (await this.getPool()).request();

      // First, mark any existing active challenges for this address as used
      // This ensures only one active challenge per address at a time
      await request
        .input('addressToDeactivate', sql.NVarChar, challenge.address.toLowerCase())
        .input('usedAt', sql.DateTime2, now).query(`
          UPDATE AuthChallenges
          SET Used = 1, UsedAt = @usedAt
          WHERE Address = @addressToDeactivate AND Used = 0
        `);

      // Now create the new challenge
      await request
        .input('id', sql.NVarChar, id)
        .input('addressForNew', sql.NVarChar, challenge.address.toLowerCase())
        .input('nonce', sql.NVarChar, challenge.nonce)
        .input('message', sql.NVarChar, challenge.message)
        .input('issuedAt', sql.DateTime2, now)
        .input('expiresAt', sql.DateTime2, challenge.expiresAt)
        .input('ipAddress', sql.NVarChar, challenge.ipAddress || null)
        .input('userAgent', sql.NVarChar, challenge.userAgent || null).query(`
          INSERT INTO AuthChallenges (Id, Address, Nonce, Message, IssuedAt, ExpiresAt, Used, IpAddress, UserAgent)
          VALUES (@id, @addressForNew, @nonce, @message, @issuedAt, @expiresAt, 0, @ipAddress, @userAgent)
        `);

      // Return the created challenge
      const result = await request
        .input('queryId', sql.NVarChar, id)
        .query<AuthChallenge>('SELECT * FROM AuthChallenges WHERE Id = @queryId');

      return result.recordset[0];
    } catch (error) {
      // If we're using a transaction, don't handle the error here
      // Let the caller handle it so they can rollback if needed
      if (transaction) {
        throw error;
      }

      console.error('Error creating auth challenge:', error);
      throw new Error('Failed to create authentication challenge');
    }
  }

  /**
   * Mark an authentication challenge as used with transaction support
   * @param challengeId The ID of the challenge to mark as used
   * @param transaction Optional transaction for atomic operations
   * @returns True if the challenge was marked as used, false otherwise
   */
  async markAuthChallengeAsUsedWithTransaction(
    challengeId: string,
    transaction?: sql.Transaction
  ): Promise<boolean> {
    const now = new Date();

    try {
      const request = transaction ? new sql.Request(transaction) : (await this.getPool()).request();

      // First check if the challenge exists and is not already used
      const checkResult = await request.input('id', sql.NVarChar, challengeId).query<{
        Used: boolean;
      }>(`
        SELECT Used FROM AuthChallenges WHERE Id = @id
      `);

      if (checkResult.recordset.length === 0) {
        console.log(`Challenge with ID ${challengeId} not found`);
        return false;
      }

      if (checkResult.recordset[0].Used) {
        console.log(`Challenge with ID ${challengeId} is already used`);
        return false;
      }

      // Now mark it as used
      const result = await request
        .input('id2', sql.NVarChar, challengeId)
        .input('usedAt', sql.DateTime2, now).query(`
          UPDATE AuthChallenges
          SET Used = 1, UsedAt = @usedAt
          WHERE Id = @id2 AND Used = 0
        `);

      const success = result.rowsAffected[0] > 0;
      console.log(
        `Marked challenge ${challengeId} as used: ${success ? 'success' : 'failed'}, rows affected: ${result.rowsAffected[0]}`
      );
      return success;
    } catch (error) {
      // If we're using a transaction, don't handle the error here
      if (transaction) {
        throw error;
      }

      console.error('Error marking auth challenge as used:', error);
      throw new Error('Failed to mark authentication challenge as used');
    }
  }

  /**
   * Get an active authentication challenge for an address
   * @param address The Ethereum address to get the challenge for
   * @returns The authentication challenge or null if not found
   */
  async getActiveAuthChallengeForAddress(address: string): Promise<AuthChallenge | null> {
    const pool = await this.getPool();
    const now = new Date();

    const result = await pool
      .request()
      .input('address', sql.NVarChar, address.toLowerCase())
      .input('now', sql.DateTime2, now).query<AuthChallenge>(`
        SELECT * FROM AuthChallenges 
        WHERE Address = @address 
        AND ExpiresAt > @now 
        AND Used = 0
        ORDER BY IssuedAt DESC
      `);

    return result.recordset.length > 0 ? result.recordset[0] : null;
  }

  /**
   * Get an authentication challenge by its ID
   * @param id The ID of the challenge to retrieve
   * @returns The authentication challenge or null if not found
   */
  async getAuthChallengeById(id: string): Promise<AuthChallenge | null> {
    const pool = await this.getPool();
    const now = new Date();

    const result = await pool
      .request()
      .input('id', sql.NVarChar, id)
      .input('now', sql.DateTime2, now).query<AuthChallenge>(`
        SELECT * FROM AuthChallenges 
        WHERE Id = @id 
        AND ExpiresAt > @now
        ORDER BY IssuedAt DESC
      `);

    return result.recordset.length > 0 ? result.recordset[0] : null;
  }

  /**
   * Delete expired authentication challenges
   * @param expirationDate Optional date to use as expiration cutoff (defaults to current time)
   * @returns The number of records deleted
   */
  async deleteExpiredAuthChallenges(expirationDate?: Date): Promise<number> {
    const pool = await this.getPool();
    const cutoffDate = expirationDate || new Date();

    const result = await pool.request().input('cutoffDate', sql.DateTime2, cutoffDate).query(`
        DELETE FROM AuthChallenges
        WHERE ExpiresAt < @cutoffDate AND Used = 0
      `);

    return result.rowsAffected[0];
  }

  /**
   * Delete used authentication challenges based on UsedAt date
   * @param olderThanDate Date to use as cutoff (challenges used before this date will be deleted)
   * @returns The number of records deleted
   */
  async deleteUsedAuthChallenges(olderThanDate: Date): Promise<number> {
    const pool = await this.getPool();

    const result = await pool.request().input('cutoffDate', sql.DateTime2, olderThanDate).query(`
        DELETE FROM AuthChallenges
        WHERE Used = 1 AND UsedAt < @cutoffDate
      `);

    return result.rowsAffected[0];
  }

  /**
   * Clean up resources when done with the database service
   */
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.close();
      this.pool = null;
      this.initialized = false;
    }
  }

  /**
   * Create a new authentication challenge
   * @param challenge The challenge data to create
   * @returns The created challenge with ID
   */
  async createAuthChallenge(challenge: AuthChallengeInput): Promise<AuthChallenge> {
    return this.createAuthChallengeWithTransaction(challenge);
  }

  /**
   * Mark an authentication challenge as used
   * @param challengeId The ID of the challenge to mark as used
   * @returns True if the challenge was marked as used, false otherwise
   */
  async markAuthChallengeAsUsed(challengeId: string): Promise<boolean> {
    return this.markAuthChallengeAsUsedWithTransaction(challengeId);
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
    const pool = await this.getPool();
    const id = uuidv4();
    const now = new Date();
    const hourAgo = new Date(now);
    hourAgo.setHours(hourAgo.getHours() - 1);

    // Set blocking rules
    // After 5 attempts in 1 hour, block for 1 hour
    // After 10 attempts in 1 hour, block for 3 hours
    // After 20 attempts in 1 hour, block for 12 hours
    const MAX_ATTEMPTS_1 = process.env.NODE_ENV === 'production' ? 5 : 20;
    const MAX_ATTEMPTS_2 = process.env.NODE_ENV === 'production' ? 10 : 40;
    const MAX_ATTEMPTS_3 = process.env.NODE_ENV === 'production' ? 20 : 80;
    const BLOCK_HOURS_1 = process.env.NODE_ENV === 'production' ? 1 : 0.1; // 6 minutes in dev
    const BLOCK_HOURS_2 = process.env.NODE_ENV === 'production' ? 3 : 0.2; // 12 minutes in dev
    const BLOCK_HOURS_3 = process.env.NODE_ENV === 'production' ? 12 : 0.5; // 30 minutes in dev

    // First, check if the identifier is already blocked
    const blockedResult = await pool
      .request()
      .input('identifier', sql.NVarChar, identifier)
      .input('type', sql.NVarChar, type)
      .input('now', sql.DateTime2, now).query<{ Id: string; BlockedUntil: Date }>(`
        SELECT Id, BlockedUntil
        FROM AuthRateLimits
        WHERE Identifier = @identifier
        AND Type = @type
        AND BlockedUntil > @now
      `);

    if (blockedResult.recordset.length > 0) {
      // Already blocked
      return {
        attemptCount: 0, // Not incrementing since blocked
        isBlocked: true,
        blockedUntil: blockedResult.recordset[0].BlockedUntil,
      };
    }

    // Get attempt count in the last hour
    const countResult = await pool
      .request()
      .input('identifier', sql.NVarChar, identifier)
      .input('type', sql.NVarChar, type)
      .input('hourAgo', sql.DateTime2, hourAgo).query<{ AttemptCount: number }>(`
        SELECT COUNT(*) AS AttemptCount
        FROM AuthRateLimits
        WHERE Identifier = @identifier
        AND Type = @type
        AND LastAttemptAt > @hourAgo
      `);

    const attemptCount = (countResult.recordset[0]?.AttemptCount || 0) + 1;
    let blockedUntil: Date | null = null;

    // Apply blocking rules
    if (attemptCount > MAX_ATTEMPTS_3) {
      blockedUntil = new Date(now);
      blockedUntil.setHours(blockedUntil.getHours() + BLOCK_HOURS_3);
    } else if (attemptCount > MAX_ATTEMPTS_2) {
      blockedUntil = new Date(now);
      blockedUntil.setHours(blockedUntil.getHours() + BLOCK_HOURS_2);
    } else if (attemptCount > MAX_ATTEMPTS_1) {
      blockedUntil = new Date(now);
      blockedUntil.setHours(blockedUntil.getHours() + BLOCK_HOURS_1);
    }

    // Record the attempt
    await pool
      .request()
      .input('id', sql.NVarChar, id)
      .input('identifier', sql.NVarChar, identifier)
      .input('type', sql.NVarChar, type)
      .input('now', sql.DateTime2, now)
      .input('blockedUntil', blockedUntil ? sql.DateTime2 : sql.NVarChar, blockedUntil || null)
      .query(`
        INSERT INTO AuthRateLimits (Id, Identifier, Type, AttemptCount, FirstAttemptAt, LastAttemptAt, BlockedUntil)
        VALUES (@id, @identifier, @type, 1, @now, @now, @blockedUntil)
      `);

    return {
      attemptCount,
      isBlocked: !!blockedUntil,
      blockedUntil: blockedUntil || undefined,
    };
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
    const pool = await this.getPool();
    const now = new Date();
    const hourAgo = new Date(now);
    hourAgo.setHours(hourAgo.getHours() - 1);

    // Check if the identifier is blocked
    const blockedResult = await pool
      .request()
      .input('identifier', sql.NVarChar, identifier)
      .input('type', sql.NVarChar, type)
      .input('now', sql.DateTime2, now).query<{ BlockedUntil: Date }>(`
        SELECT BlockedUntil
        FROM AuthRateLimits
        WHERE Identifier = @identifier
        AND Type = @type
        AND BlockedUntil > @now
        ORDER BY BlockedUntil DESC
      `);

    if (blockedResult.recordset.length > 0) {
      return {
        isBlocked: true,
        blockedUntil: blockedResult.recordset[0].BlockedUntil,
        attemptCount: 0,
      };
    }

    // Get attempt count in the last hour
    const countResult = await pool
      .request()
      .input('identifier', sql.NVarChar, identifier)
      .input('type', sql.NVarChar, type)
      .input('hourAgo', sql.DateTime2, hourAgo).query<{ AttemptCount: number }>(`
        SELECT COUNT(*) AS AttemptCount
        FROM AuthRateLimits
        WHERE Identifier = @identifier
        AND Type = @type
        AND LastAttemptAt > @hourAgo
      `);

    return {
      isBlocked: false,
      attemptCount: countResult.recordset[0]?.AttemptCount || 0,
    };
  }

  /**
   * Clean up expired rate limiting entries
   * @param olderThan Date threshold for cleanup
   * @returns Number of records deleted
   */
  async cleanupRateLimits(olderThan: Date): Promise<number> {
    const pool = await this.getPool();

    const result = await pool.request().input('cutoffDate', sql.DateTime2, olderThan).query(`
      DELETE FROM AuthRateLimits
      WHERE LastAttemptAt < @cutoffDate
      AND (BlockedUntil IS NULL OR BlockedUntil < @cutoffDate)
    `);

    return result.rowsAffected[0];
  }

  /**
   * Clear rate limiting for a specific identifier
   * This is primarily for development/testing purposes
   * @param identifier The identifier (address or IP) to clear rate limiting for
   * @param type The type of identifier (ADDRESS or IP)
   * @returns Number of records deleted
   */
  async clearRateLimitingForIdentifier(
    identifier: string,
    type: 'ADDRESS' | 'IP'
  ): Promise<number> {
    const pool = await this.getPool();

    const result = await pool
      .request()
      .input('identifier', sql.NVarChar, identifier)
      .input('type', sql.NVarChar, type).query(`
        DELETE FROM AuthRateLimits
        WHERE Identifier = @identifier AND Type = @type
      `);

    return result.rowsAffected[0];
  }

  /**
   * Create a new refresh token for a user
   * @param refreshToken The refresh token data to create
   * @returns The created refresh token record
   */
  async createRefreshToken(refreshToken: RefreshTokenInput): Promise<RefreshToken> {
    const pool = await this.getPool();
    const id = uuidv4();
    const now = new Date();

    await pool
      .request()
      .input('id', sql.NVarChar, id)
      .input('userAddress', sql.NVarChar, refreshToken.userAddress.toLowerCase())
      .input('token', sql.NVarChar, refreshToken.token)
      .input('issuedAt', sql.DateTime2, now)
      .input('expiresAt', sql.DateTime2, refreshToken.expiresAt)
      .input('ipAddress', sql.NVarChar, refreshToken.ipAddress || null)
      .input('userAgent', sql.NVarChar, refreshToken.userAgent || null).query(`
        INSERT INTO RefreshTokens (Id, UserAddress, Token, IssuedAt, ExpiresAt, IpAddress, UserAgent)
        VALUES (@id, @userAddress, @token, @issuedAt, @expiresAt, @ipAddress, @userAgent)
      `);

    // Return the created refresh token
    const result = await pool
      .request()
      .input('id', sql.NVarChar, id)
      .query<RefreshToken>('SELECT * FROM RefreshTokens WHERE Id = @id');

    return result.recordset[0];
  }

  /**
   * Get a refresh token by its token value
   * @param token The refresh token value
   * @returns The refresh token record or null if not found
   */
  async getRefreshTokenByToken(token: string): Promise<RefreshToken | null> {
    const pool = await this.getPool();

    const result = await pool.request().input('token', sql.NVarChar, token).query<RefreshToken>(`
        SELECT * FROM RefreshTokens
        WHERE Token = @token AND Used = 0 AND Revoked = 0 AND ExpiresAt > GETUTCDATE()
      `);

    return result.recordset.length > 0 ? result.recordset[0] : null;
  }

  /**
   * Mark a refresh token as used and create a new one (token rotation)
   * @param tokenId The ID of the token to mark as used
   * @param refreshToken The new refresh token data
   * @returns The new refresh token record
   */
  async rotateRefreshToken(
    tokenId: string,
    refreshToken: RefreshTokenInput
  ): Promise<RefreshToken> {
    const pool = await this.getPool();
    const transaction = await this.getTransaction();

    try {
      const newId = uuidv4();
      const now = new Date();

      // Mark the old token as used in the transaction
      await new sql.Request(transaction)
        .input('id', sql.NVarChar, tokenId)
        .input('usedAt', sql.DateTime2, now)
        .input('newId', sql.NVarChar, newId).query(`
          UPDATE RefreshTokens
          SET Used = 1, UsedAt = @usedAt, ReplacedByTokenId = @newId
          WHERE Id = @id AND Used = 0 AND Revoked = 0
        `);

      // Create a new token in the transaction
      // Use safe property access for userAddress to handle case sensitivity
      const userAddressValue = refreshToken.userAddress || (refreshToken as any).UserAddress;
      if (!userAddressValue) {
        throw new Error('User address is missing in refresh token input');
      }

      await new sql.Request(transaction)
        .input('id', sql.NVarChar, newId)
        .input('userAddress', sql.NVarChar, userAddressValue.toLowerCase())
        .input('token', sql.NVarChar, refreshToken.token)
        .input('issuedAt', sql.DateTime2, now)
        .input('expiresAt', sql.DateTime2, refreshToken.expiresAt)
        .input('ipAddress', sql.NVarChar, refreshToken.ipAddress || null)
        .input('userAgent', sql.NVarChar, refreshToken.userAgent || null).query(`
          INSERT INTO RefreshTokens (Id, UserAddress, Token, IssuedAt, ExpiresAt, IpAddress, UserAgent)
          VALUES (@id, @userAddress, @token, @issuedAt, @expiresAt, @ipAddress, @userAgent)
        `);

      // Commit the transaction
      await transaction.commit();

      // Get and return the new token
      const result = await pool
        .request()
        .input('id', sql.NVarChar, newId)
        .query<RefreshToken>('SELECT * FROM RefreshTokens WHERE Id = @id');

      return result.recordset[0];
    } catch (error) {
      // Rollback the transaction on error
      await transaction.rollback();
      console.error('Error rotating refresh token:', error);
      throw new Error('Failed to rotate refresh token');
    }
  }

  /**
   * Revoke a refresh token by token value
   * @param token The refresh token value to revoke
   * @returns True if successfully revoked, false otherwise
   */
  async revokeRefreshToken(token: string): Promise<boolean> {
    const pool = await this.getPool();
    const now = new Date();

    const result = await pool
      .request()
      .input('token', sql.NVarChar, token)
      .input('revokedAt', sql.DateTime2, now).query(`
        UPDATE RefreshTokens
        SET Revoked = 1, RevokedAt = @revokedAt
        WHERE Token = @token AND Revoked = 0
      `);

    return result.rowsAffected[0] > 0;
  }

  /**
   * Revoke all refresh tokens for a user
   * @param userAddress The user's wallet address
   * @returns The number of tokens revoked
   */
  async revokeAllUserRefreshTokens(userAddress: string): Promise<number> {
    const pool = await this.getPool();
    const now = new Date();

    const result = await pool
      .request()
      .input('userAddress', sql.NVarChar, userAddress.toLowerCase())
      .input('revokedAt', sql.DateTime2, now).query(`
        UPDATE RefreshTokens
        SET Revoked = 1, RevokedAt = @revokedAt
        WHERE UserAddress = @userAddress AND Revoked = 0 AND Used = 0
      `);

    return result.rowsAffected[0];
  }

  /**
   * Clean up expired refresh tokens
   * @param expirationDate Optional date to use instead of current time
   * @returns Number of tokens cleaned up
   */
  async cleanupExpiredRefreshTokens(expirationDate?: Date): Promise<number> {
    const pool = await this.getPool();
    const date = expirationDate || new Date();

    const result = await pool.request().input('date', sql.DateTime2, date).query(`
      DELETE FROM RefreshTokens
      WHERE ExpiresAt < @date
    `);

    return result.rowsAffected[0];
  }
}
