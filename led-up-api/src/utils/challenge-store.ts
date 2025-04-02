/**
 * Challenge store utility for managing authentication challenges.
 * In a production environment, this should be replaced with a persistent store like Azure Table Storage.
 */
import { randomBytes } from 'crypto';

// Challenge expiration time in milliseconds (5 minutes)
const CHALLENGE_EXPIRY = 5 * 60 * 1000;

// In-memory store for challenges (address -> { challenge, expiresAt })
// Note: In production, this should be replaced with a persistent store
interface ChallengeData {
  challenge: string;
  expiresAt: number;
}

// NOTE: This should be replaced with a persistent store in production
const challenges = new Map<string, ChallengeData>();

/**
 * Generate a new challenge for an address
 *
 * @param address - The Ethereum address to generate a challenge for
 * @returns The generated challenge and its expiration timestamp
 */
export function generateChallenge(address: string): { challenge: string; expiresAt: number } {
  // Generate a random challenge
  const challenge = `Sign this message to authenticate with LED-UP: ${randomBytes(16).toString('hex')}`;

  // Set expiration time
  const expiresAt = Date.now() + CHALLENGE_EXPIRY;

  // Store the challenge
  challenges.set(address.toLowerCase(), { challenge, expiresAt });

  return { challenge, expiresAt };
}

/**
 * Verify a challenge for an address
 *
 * @param address - The Ethereum address to verify the challenge for
 * @param challenge - The challenge to verify
 * @returns True if the challenge is valid, false otherwise
 */
export function verifyChallenge(address: string, challenge: string): boolean {
  const lowerAddress = address.toLowerCase();
  const storedData = challenges.get(lowerAddress);

  // Check if challenge exists and is not expired
  if (!storedData || storedData.challenge !== challenge || Date.now() > storedData.expiresAt) {
    return false;
  }

  // Remove the challenge after verification (one-time use)
  challenges.delete(lowerAddress);

  return true;
}

/**
 * Get the challenge for an address
 *
 * @param address - The Ethereum address to get the challenge for
 * @returns The challenge data if it exists and is not expired, null otherwise
 */
export function getChallenge(address: string): ChallengeData | null {
  const lowerAddress = address.toLowerCase();
  const storedData = challenges.get(lowerAddress);

  // Check if challenge exists and is not expired
  if (!storedData || Date.now() > storedData.expiresAt) {
    // Clean up expired challenge
    if (storedData) {
      challenges.delete(lowerAddress);
    }
    return null;
  }

  return storedData;
}

/**
 * Clean up expired challenges
 */
export function cleanupExpiredChallenges(): void {
  const now = Date.now();

  for (const [address, data] of challenges.entries()) {
    if (now > data.expiresAt) {
      challenges.delete(address);
    }
  }
}

// Run cleanup every minute
setInterval(cleanupExpiredChallenges, 60 * 1000);
