/**
 * DID Authentication API Service
 * Handles communication with the DID API for authentication
 */

// API base URL - would be configured from environment in production
const API_BASE_URL = process.env.NEXT_PUBLIC_DID_API_URL || 'http://localhost:7071/api';

// Types
export interface ChallengeResponse {
  success: boolean;
  data: {
    did: string;
    challenge: string;
    message: string;
    expires: number;
  };
  error?: string;
}

export interface AuthenticationResponse {
  success: boolean;
  data: {
    did: string;
    authenticated: boolean;
    controller: string;
    token: string;
  };
  error?: string;
}

export interface CheckAuthResponse {
  success: boolean;
  data: {
    authenticated: boolean;
    user: {
      did: string;
      address: string;
    };
  };
  error?: string;
}

/**
 * Request a challenge for the given DID
 * @param did Decentralized Identifier
 * @returns Challenge response containing the message to sign
 */
export async function requestChallenge(did: string): Promise<ChallengeResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/generate-challenge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ did }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to request challenge');
    }

    return await response.json();
  } catch (error: any) {
    return {
      success: false,
      data: {
        did: '',
        challenge: '',
        message: '',
        expires: 0,
      },
      error: error.message || 'An unexpected error occurred',
    };
  }
}

/**
 * Authenticate using a signed challenge
 * @param did Decentralized Identifier
 * @param message The message that was signed
 * @param signature The signature of the message
 * @returns Authentication response containing the JWT token
 */
export async function authenticate(did: string, message: string, signature: string): Promise<AuthenticationResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/authenticate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ did, message, signature }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Authentication failed');
    }

    return await response.json();
  } catch (error: any) {
    return {
      success: false,
      data: {
        did: '',
        authenticated: false,
        controller: '',
        token: '',
      },
      error: error.message || 'An unexpected error occurred',
    };
  }
}

/**
 * Check if the user is currently authenticated
 * @param token JWT token
 * @returns Response indicating if the user is authenticated
 */
export async function checkAuth(token: string): Promise<CheckAuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/check`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to check authentication');
    }

    return await response.json();
  } catch (error: any) {
    return {
      success: false,
      data: {
        authenticated: false,
        user: {
          did: '',
          address: '',
        },
      },
      error: error.message || 'An unexpected error occurred',
    };
  }
}

/**
 * Refresh the authentication token
 * @param token Current JWT token
 * @returns New JWT token
 */
export async function refreshToken(token: string): Promise<{ token: string } | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return { token: data.data.token };
  } catch (error) {
    return null;
  }
}

/**
 * Creates a DID for the provided address or gets the existing one
 * @param address Ethereum address to create or retrieve a DID for
 * @param network Network to use (default: mainnet)
 * @returns The DID associated with the address
 */
export async function getOrCreateDid(address: string, network: string = 'mainnet'): Promise<string | null> {
  try {
    // First check if a DID already exists for this address
    const response = await fetch(`${API_BASE_URL}/did/address/${address}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // If we get a DID, return it
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data.did) {
        return data.data.did;
      }
    }

    // If no DID exists, create one
    const createResponse = await fetch(`${API_BASE_URL}/did`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address, network }),
    });

    if (!createResponse.ok) {
      throw new Error('Failed to create DID');
    }

    const createData = await createResponse.json();
    if (createData.success && createData.data.did) {
      return createData.data.did;
    }

    return null;
  } catch (error) {
    console.error('Error getting or creating DID:', error);
    return null;
  }
}
