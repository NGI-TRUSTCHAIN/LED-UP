import { BinaryLike, createHash, createHmac } from 'crypto';

/**
 * Supported hash algorithms.
 */
export enum HashAlgorithm {
  SHA256 = 'sha256',
  SHA512 = 'sha512',
  SHA3_256 = 'sha3-256',
  SHA3_512 = 'sha3-512',
  MD5 = 'md5', // Not recommended for security-sensitive applications
}

/**
 * Supported output encoding formats.
 */
export enum HashEncoding {
  HEX = 'hex',
  BASE64 = 'base64',
  BINARY = 'binary',
}

/**
 * Service for cryptographic hashing operations.
 * Provides functionality for hashing data using various algorithms and output formats.
 */
export class HashingService {
  private readonly defaultAlgorithm: HashAlgorithm;
  private readonly defaultEncoding: HashEncoding;

  /**
   * Creates a new instance of the HashingService.
   *
   * @param defaultAlgorithm - The default hashing algorithm to use (default: SHA256)
   * @param defaultEncoding - The default output encoding to use (default: HEX)
   */
  constructor(
    defaultAlgorithm: HashAlgorithm = HashAlgorithm.SHA256,
    defaultEncoding: HashEncoding = HashEncoding.HEX
  ) {
    this.defaultAlgorithm = defaultAlgorithm;
    this.defaultEncoding = defaultEncoding;
  }

  /**
   * Hashes data using the SHA-256 algorithm and returns the result in binary format.
   *
   * This method takes a string, computes its SHA-256 hash, and returns the resulting hash in binary format.
   * The SHA-256 algorithm is commonly used for data integrity and cryptographic purposes.
   *
   * @param data - The data to be hashed, provided as a string
   * @returns A promise that resolves with the hashed data in binary format
   * @throws Will throw an error if hashing fails
   */
  public async hashData(data: string): Promise<BinaryLike> {
    try {
      return createHash(HashAlgorithm.SHA256).update(data).digest('binary');
    } catch (error: any) {
      throw new Error(`Failed to hash data: ${error.message}`);
    }
  }

  /**
   * Hashes data using the SHA-256 algorithm and returns the result in hexadecimal format.
   *
   * This method computes the SHA-256 hash of the input string and returns the result as a hexadecimal string,
   * which is useful for displaying or storing hashes in a human-readable format.
   *
   * @param data - The data to be hashed, provided as a string
   * @returns A promise that resolves with the hashed data in hexadecimal format
   * @throws Will throw an error if hashing fails
   */
  public async hashHex(data: string): Promise<string> {
    try {
      return createHash(HashAlgorithm.SHA256).update(data).digest('hex');
    } catch (error: any) {
      throw new Error(`Failed to hash data: ${error.message}`);
    }
  }

  /**
   * Hashes data using the SHA-256 algorithm and returns the result in base64 format.
   *
   * This method computes the SHA-256 hash of the input string and returns the result as a base64 string,
   * which is useful for compact representation in web applications.
   *
   * @param data - The data to be hashed, provided as a string
   * @returns A promise that resolves with the hashed data in base64 format
   * @throws Will throw an error if hashing fails
   */
  public async hashBase64(data: string): Promise<string> {
    try {
      return createHash(HashAlgorithm.SHA256).update(data).digest('base64');
    } catch (error: any) {
      throw new Error(`Failed to hash data: ${error.message}`);
    }
  }

  /**
   * Hashes data using the specified algorithm and returns the result in the specified format.
   *
   * This method provides flexibility to choose different hashing algorithms and output formats.
   *
   * @param data - The data to be hashed, provided as a string
   * @param algorithm - The hashing algorithm to use (default: the service's default algorithm)
   * @param encoding - The output encoding format (default: the service's default encoding)
   * @returns A promise that resolves with the hashed data in the specified format
   * @throws Will throw an error if hashing fails
   */
  public async hashWithAlgorithm(
    data: string,
    algorithm: HashAlgorithm = this.defaultAlgorithm,
    encoding: HashEncoding = this.defaultEncoding
  ): Promise<string | BinaryLike> {
    try {
      return createHash(algorithm).update(data).digest(encoding);
    } catch (error: any) {
      throw new Error(`Failed to hash data with algorithm ${algorithm}: ${error.message}`);
    }
  }

  /**
   * Creates a hash of an object by first converting it to a JSON string.
   *
   * @param obj - The object to hash
   * @param algorithm - The hashing algorithm to use (default: the service's default algorithm)
   * @param encoding - The output encoding format (default: the service's default encoding)
   * @returns A promise that resolves with the hashed object in the specified format
   * @throws Will throw an error if hashing fails
   */
  public async hashObject(
    obj: Record<string, any>,
    algorithm: HashAlgorithm = this.defaultAlgorithm,
    encoding: HashEncoding = this.defaultEncoding
  ): Promise<string> {
    try {
      const jsonString = JSON.stringify(obj);
      return this.hashWithAlgorithm(jsonString, algorithm, encoding) as Promise<string>;
    } catch (error: any) {
      throw new Error(`Failed to hash object: ${error.message}`);
    }
  }

  /**
   * Verifies if a given data matches a given hash.
   *
   * @param data - The data to verify
   * @param hash - The hash to compare against
   * @param algorithm - The hashing algorithm to use (default: the service's default algorithm)
   * @param encoding - The encoding of the hash (default: the service's default encoding)
   * @returns A promise that resolves with true if the data matches the hash, false otherwise
   */
  public async verifyHash(
    data: string,
    hash: string,
    algorithm: HashAlgorithm = this.defaultAlgorithm,
    encoding: HashEncoding = this.defaultEncoding
  ): Promise<boolean> {
    try {
      const computedHash = (await this.hashWithAlgorithm(data, algorithm, encoding)) as string;
      return computedHash === hash;
    } catch (error) {
      return false;
    }
  }

  /**
   * Creates an HMAC (Hash-based Message Authentication Code) for the given data using a secret key.
   *
   * HMAC provides a way to verify both the data integrity and the authenticity of a message.
   *
   * @param data - The data to create an HMAC for
   * @param secretKey - The secret key to use for the HMAC
   * @param algorithm - The hashing algorithm to use (default: the service's default algorithm)
   * @param encoding - The output encoding format (default: the service's default encoding)
   * @returns A promise that resolves with the HMAC in the specified format
   * @throws Will throw an error if HMAC creation fails
   */
  public async createHmac(
    data: string,
    secretKey: string,
    algorithm: HashAlgorithm = this.defaultAlgorithm,
    encoding: HashEncoding = this.defaultEncoding
  ): Promise<string> {
    try {
      return createHmac(algorithm, secretKey).update(data).digest(encoding);
    } catch (error: any) {
      throw new Error(`Failed to create HMAC: ${error.message}`);
    }
  }

  /**
   * Verifies an HMAC against the original data and secret key.
   *
   * @param data - The original data
   * @param hmac - The HMAC to verify
   * @param secretKey - The secret key used to create the HMAC
   * @param algorithm - The hashing algorithm used (default: the service's default algorithm)
   * @param encoding - The encoding of the HMAC (default: the service's default encoding)
   * @returns A promise that resolves with true if the HMAC is valid, false otherwise
   */
  public async verifyHmac(
    data: string,
    hmac: string,
    secretKey: string,
    algorithm: HashAlgorithm = this.defaultAlgorithm,
    encoding: HashEncoding = this.defaultEncoding
  ): Promise<boolean> {
    try {
      const computedHmac = await this.createHmac(data, secretKey, algorithm, encoding);
      return computedHmac === hmac;
    } catch (error) {
      return false;
    }
  }

  /**
   * Creates a hash of a file from its buffer.
   *
   * @param buffer - The file buffer to hash
   * @param algorithm - The hashing algorithm to use (default: the service's default algorithm)
   * @param encoding - The output encoding format (default: the service's default encoding)
   * @returns A promise that resolves with the hashed file in the specified format
   * @throws Will throw an error if hashing fails
   */
  public async hashBuffer(
    buffer: Buffer,
    algorithm: HashAlgorithm = this.defaultAlgorithm,
    encoding: HashEncoding = this.defaultEncoding
  ): Promise<string> {
    try {
      return createHash(algorithm).update(buffer).digest(encoding);
    } catch (error: any) {
      throw new Error(`Failed to hash buffer: ${error.message}`);
    }
  }

  /**
   * Creates a hash of a string with a salt prepended to it.
   *
   * @param data - The data to hash
   * @param salt - The salt to prepend to the data
   * @param algorithm - The hashing algorithm to use (default: the service's default algorithm)
   * @param encoding - The output encoding format (default: the service's default encoding)
   * @returns A promise that resolves with the salted hash in the specified format
   * @throws Will throw an error if hashing fails
   */
  public async hashWithSalt(
    data: string,
    salt: string,
    algorithm: HashAlgorithm = this.defaultAlgorithm,
    encoding: HashEncoding = this.defaultEncoding
  ): Promise<string> {
    try {
      const saltedData = salt + data;
      return this.hashWithAlgorithm(saltedData, algorithm, encoding) as Promise<string>;
    } catch (error: any) {
      throw new Error(`Failed to hash with salt: ${error.message}`);
    }
  }
}
