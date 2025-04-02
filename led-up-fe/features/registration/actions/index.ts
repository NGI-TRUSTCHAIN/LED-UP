'use server';

import { ethers } from 'ethers';
import { revalidatePath } from 'next/cache';
import { RegistrationResponse, RecordStatus, ConsentStatus } from '../types';

// Import ABIs
import * as ABI from '@/abi';

// Contract addresses - these would typically come from environment variables
const DID_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_DID_REGISTRY_ADDRESS || '';
const DID_AUTH_ADDRESS = process.env.NEXT_PUBLIC_DID_AUTH_ADDRESS || '';
const DID_ACCESS_CONTROL_ADDRESS = process.env.NEXT_PUBLIC_DID_ACCESS_CONTROL_ADDRESS || '';
const DATA_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_DATA_REGISTRY_ADDRESS || '';

// Helper function to get a provider
function getProvider() {
  // Use environment variable for RPC URL or fallback to a default
  const rpcUrl = process.env.RPC_URL || 'http://localhost:8545';
  return new ethers.JsonRpcProvider(rpcUrl);
}

// Helper function to get a signer
async function getSigner() {
  const provider = getProvider();
  // In a server action, we need to use a private key to sign transactions
  const privateKey = process.env.PRIVATE_KEY || '';
  if (!privateKey) {
    throw new Error('Private key not configured');
  }
  return new ethers.Wallet(privateKey, provider);
}

/**
 * Register a DID in the DID Registry
 */
export async function registerDid(prevState: RegistrationResponse, formData: FormData): Promise<RegistrationResponse> {
  try {
    const did = formData.get('did') as string;
    const document = formData.get('document') as string;
    const publicKey = formData.get('publicKey') as string;
    const skipSigning = formData.get('skipSigning') === 'true';

    if (!did || !document || !publicKey) {
      return {
        success: false,
        error: 'Missing required fields',
        message: 'DID, document, and public key are required',
      };
    }

    // If skipSigning is true, we'll just simulate success
    // This is a temporary solution until we implement proper client-side signing
    if (skipSigning) {
      return {
        success: true,
        data: {
          did,
          transactionHash: '0x' + Array(64).fill('0').join(''),
          blockNumber: 0,
        },
        message: 'DID registered successfully',
      };
    }

    const signer = await getSigner();
    const didRegistry = new ethers.Contract(DID_REGISTRY_ADDRESS, ABI.DidRegistryABI, signer);

    // Register the DID
    const tx = await didRegistry.registerDid(did, document, publicKey);
    const receipt = await tx.wait();

    // Revalidate the path to update the UI
    revalidatePath('/register');

    return {
      success: true,
      data: {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
      },
      message: 'DID registered successfully',
    };
  } catch (error: any) {
    console.error('Error registering DID:', error);
    return {
      success: false,
      error: error.message || 'Unknown error',
      message: 'Failed to register DID',
    };
  }
}

/**
 * Grant a role to a DID in the DID Access Control
 */
export async function grantRole(prevState: RegistrationResponse, formData: FormData): Promise<RegistrationResponse> {
  try {
    const did = formData.get('did') as string;
    const role = formData.get('role') as string;
    const skipSigning = formData.get('skipSigning') === 'true';

    if (!did || !role) {
      return {
        success: false,
        error: 'Missing required fields',
        message: 'DID and role are required',
      };
    }

    // If skipSigning is true, we'll just simulate success
    // This is a temporary solution until we implement proper client-side signing
    if (skipSigning) {
      return {
        success: true,
        data: {
          transactionHash: '0x' + Array(64).fill('0').join(''),
          blockNumber: 0,
        },
        message: `${role.charAt(0).toUpperCase() + role.slice(1)} role granted successfully`,
      };
    }

    const signer = await getSigner();
    const didAccessControl = new ethers.Contract(DID_ACCESS_CONTROL_ADDRESS, ABI.DidAccessControlABI, signer);

    // Calculate the role hash based on the role string
    let roleHash;
    if (role === 'consumer') {
      roleHash = await didAccessControl.CONSUMER_ROLE();
    } else if (role === 'producer') {
      roleHash = await didAccessControl.PRODUCER_ROLE();
    } else {
      return {
        success: false,
        error: 'Invalid role',
        message: 'Role must be either consumer or producer',
      };
    }

    // Grant the role to the DID
    const tx = await didAccessControl.grantDidRole(did, roleHash);
    const receipt = await tx.wait();

    // Revalidate the path to update the UI
    revalidatePath('/register');

    return {
      success: true,
      data: {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
      },
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} role granted successfully`,
    };
  } catch (error: any) {
    console.error('Error granting role:', error);
    return {
      success: false,
      error: error.message || 'Unknown error',
      message: 'Failed to grant role',
    };
  }
}

/**
 * Register a producer in the Data Registry
 */
export async function registerProducer(
  prevState: RegistrationResponse,
  formData: FormData
): Promise<RegistrationResponse> {
  try {
    const ownerDid = formData.get('ownerDid') as string;
    const producer = formData.get('producer') as string;
    const status = parseInt(formData.get('status') as string) || RecordStatus.ACTIVE;
    const consent = parseInt(formData.get('consent') as string) || ConsentStatus.PENDING;
    const skipSigning = formData.get('skipSigning') === 'true';

    if (!ownerDid || !producer) {
      return {
        success: false,
        error: 'Missing required fields',
        message: 'Owner DID and producer address are required',
      };
    }

    // If skipSigning is true, we'll just simulate success
    // This is a temporary solution until we implement proper client-side signing
    if (skipSigning) {
      return {
        success: true,
        data: {
          transactionHash: '0x' + Array(64).fill('0').join(''),
          blockNumber: 0,
        },
        message: 'Producer registered successfully',
      };
    }

    const signer = await getSigner();
    const dataRegistry = new ethers.Contract(DATA_REGISTRY_ADDRESS, ABI.DataRegistryABI, signer);

    // Register the producer
    const tx = await dataRegistry.registerProducer(status, consent);
    const receipt = await tx.wait();

    // Revalidate the path to update the UI
    revalidatePath('/register');

    return {
      success: true,
      data: {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
      },
      message: 'Producer registered successfully',
    };
  } catch (error: any) {
    console.error('Error registering producer:', error);
    return {
      success: false,
      error: error.message || 'Unknown error',
      message: 'Failed to register producer',
    };
  }
}

/**
 * Authenticate a DID with a role
 */
export async function authenticateDid(
  prevState: RegistrationResponse,
  formData: FormData
): Promise<RegistrationResponse> {
  try {
    const did = formData.get('did') as string;
    const role = formData.get('role') as string;
    const skipSigning = formData.get('skipSigning') === 'true';

    if (!did || !role) {
      return {
        success: false,
        error: 'Missing required fields',
        message: 'DID and role are required',
      };
    }

    // If skipSigning is true, we'll just simulate success
    // This is a temporary solution until we implement proper client-side signing
    if (skipSigning) {
      return {
        success: true,
        data: {
          isAuthenticated: true,
        },
        message: 'DID authenticated successfully',
      };
    }

    const provider = getProvider();
    const didAuth = new ethers.Contract(DID_AUTH_ADDRESS, ABI.DidAuthABI, provider);

    // Calculate the role hash based on the role string
    let roleHash;
    if (role === 'consumer') {
      roleHash = await didAuth.CONSUMER_ROLE();
    } else if (role === 'producer') {
      roleHash = await didAuth.PRODUCER_ROLE();
    } else {
      return {
        success: false,
        error: 'Invalid role',
        message: 'Role must be either consumer or producer',
      };
    }

    // Authenticate the DID with the role
    const isAuthenticated = await didAuth.authenticate(did, roleHash);

    return {
      success: true,
      data: {
        isAuthenticated,
      },
      message: isAuthenticated ? 'DID authenticated successfully' : 'DID authentication failed',
    };
  } catch (error: any) {
    console.error('Error authenticating DID:', error);
    return {
      success: false,
      error: error.message || 'Unknown error',
      message: 'Failed to authenticate DID',
    };
  }
}

/**
 * Get DID document from the DID Registry
 */
export async function getDIDDocument(did: string): Promise<RegistrationResponse> {
  try {
    if (!did) {
      return {
        success: false,
        error: 'Missing DID',
        message: 'DID is required',
      };
    }

    const provider = getProvider();
    const didRegistry = new ethers.Contract(DID_REGISTRY_ADDRESS, ABI.DidRegistryABI, provider);

    // Resolve the DID to get the document
    const document = await didRegistry.resolveDid(did);

    return {
      success: true,
      data: document,
      message: 'DID document retrieved successfully',
    };
  } catch (error: any) {
    console.error('Error getting DID document:', error);
    return {
      success: false,
      error: error.message || 'Unknown error',
      message: 'Failed to get DID document',
    };
  }
}
