'use server';
import { revalidatePath } from 'next/cache';
import { PinataSDK } from 'pinata';
import { ConsentStatus, RecordStatus } from '@/types';
import { encrypt, decrypt, toCipherKey } from '@/utils/encrypt';
import axios from 'axios';
import { randomUUID } from 'crypto';

type RegisterDataParam = {
  consent: ConsentStatus;
  producer: string;
  data: any;
};

// API base URL for blockchain interactions
const base_url = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

// Initialize Pinata SDK
export const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_API_JWT!,
  pinataGateway: process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL!,
});

// Encryption key for data security
const encryptionKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY!;

/**
 * Retrieves a file from IPFS using its CID
 * @param cid Content Identifier for the data stored on IPFS
 * @returns The retrieved file data
 */
export const retrieveFile = async (cid: string) => {
  try {
    const response = await pinata.gateways.public.get(cid);
    return response;
  } catch (error) {
    console.error(`Error fetching data from IPFS with CID ${cid}:`, error);
    throw error;
  }
};

/**
 * Lists all files stored in Pinata
 * @returns List of files stored in Pinata
 */
export const listFiles = async () => {
  try {
    const files = await pinata.files.public.list();
    return files;
  } catch (error) {
    console.error('Error listing files from Pinata:', error);
    throw error;
  }
};

/**
 * Uploads and encrypts data to IPFS
 * @param param0 Object containing consent status and data to upload
 * @returns Response data from the upload operation
 */
export const upload = async ({ consent, data, producer }: RegisterDataParam) => {
  try {
    // Encrypt data before uploading
    const encryptedData = encrypt(JSON.stringify(data), toCipherKey(encryptionKey));

    const pinResponse = await pinata.upload.public.json(encryptedData, {
      metadata: {
        name: `data-${Date.now()}`,
        keyvalues: {
          cidVersion: '1',
        },
      },
    });

    return pinResponse;
  } catch (e) {
    console.error('Error uploading data:', e);
    return { error: 'Internal Server Error' };
  }
};

/**
 * Reads the latest completed records from the blockchain
 * @returns List of completed blocks/records
 */
export const readLatestCompletedRecord = async () => {
  try {
    const response = await fetch(`${base_url}/getCompletedBlocks`, { next: { revalidate: 60 } });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching completed blocks:', error);
    return { error: 'Failed to retrieve completed blocks' };
  }
};

/**
 * Encrypts and uploads data to IPFS
 * @param data Data to encrypt and upload
 * @param name Name for the data in IPFS metadata
 * @returns Response from the IPFS upload
 */
export const encryptAndUpload = async (data: any, name: string) => {
  try {
    const encryptedData = encrypt(JSON.stringify(data), toCipherKey(encryptionKey));

    const pinResponse = await pinata.upload.public.json(encryptedData, {
      metadata: {
        name: name,
        keyvalues: {
          cidVersion: '1',
        },
      },
    });

    return pinResponse;
  } catch (error) {
    console.error('Error encrypting and uploading data to IPFS:', error);
    throw error;
  }
};

/**
 * Fetches and decrypts data from IPFS
 * @param cid Content Identifier for the encrypted data
 * @returns Object containing both decrypted and raw data
 */
export const fetchAndDecrypt = async (cid: string) => {
  try {
    const encryptedData = await retrieveFile(cid);

    // Handle the encryption/decryption type issues by ensuring we have a string
    let dataToDecrypt: string;

    if (typeof encryptedData === 'string') {
      dataToDecrypt = encryptedData;
    } else if (typeof encryptedData === 'object') {
      dataToDecrypt = JSON.stringify(encryptedData);
    } else {
      throw new Error('Unexpected data format from IPFS');
    }

    // Create a compatible object for the decrypt function if needed
    // This depends on what the decrypt function expects
    const decryptedData = decrypt(dataToDecrypt as any, toCipherKey(encryptionKey));

    return {
      data: decryptedData,
      raw: encryptedData,
    };
  } catch (error) {
    console.error(`Error fetching and decrypting data from IPFS with CID ${cid}:`, error);
    throw error;
  }
};

/**
 * Unpins (deletes) data from IPFS
 * @param cid Content Identifier for the data to unpin
 * @returns Response from the unpin operation
 */
export const unpinFromIPFS = async (cid: string) => {
  try {
    // Use the SDK's unpin method with the correct format
    const result = await pinata.files.public.delete([cid]);
    return result;
  } catch (error) {
    console.error(`Error unpinning data from IPFS with CID ${cid}:`, error);
    throw error;
  }
};

export const generateRecordId = (resourceType: string) => {
  return `${resourceType}-${randomUUID().toLocaleLowerCase()}`;
};
