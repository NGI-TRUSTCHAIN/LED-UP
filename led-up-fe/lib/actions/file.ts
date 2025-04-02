'use server';
import { revalidatePath } from 'next/cache';

const producer = '0x7bE129dc9F7715f51D459c36bB127Cc2FaE98B32'; //hardcoded to single address
const recordId = 'd0658788-9eeb-4b40-9053-09e1adacdf6a'; //hardcoded to single record id

const base_url = process.env.NEXT_PUBLIC_FILE_API_URL || 'http://localhost:7071/api';

// Import the safe Pinata functions from our client module
// These will only be imported at runtime, not during build
async function getDynamicPinata() {
  if (typeof window === 'undefined') {
    // We're on the server or during build, use dynamic import
    const { getPinata } = await import('./pinata-client');
    return getPinata();
  }
  return null; // We shouldn't get here during SSG
}

export const retrieveFile = async (cid: string) => {
  try {
    const pinata = await getDynamicPinata();
    const response = await pinata.gateways.get(cid);
    return response;
  } catch (error) {
    console.error('Error retrieving file:', error);
    return null;
  }
};

export const listFiles = async () => {
  try {
    const pinata = await getDynamicPinata();
    const files = await pinata.listFiles();
    return files;
  } catch (error) {
    console.error('Error listing files:', error);
    return { items: [], count: 0 };
  }
};

enum ConsentStatus {
  Allowed = 0, // Consent is granted
  Denied = 1, // Consent is denied
  NotSet = 2, // Consent is pending
}

type FileType = {
  data: Buffer;
  name: string;
  type: string;
  size: number;
};

type RegisterDataParam = {
  consent: ConsentStatus;
  data?: unknown;
  file?: FileType;
  metadata?: unknown;
};

export const upload = async ({ consent, data, file, metadata }: RegisterDataParam) => {
  try {
    let uploadResult;

    // If a file was uploaded
    if (file) {
      // Get Pinata instance
      const pinata = await getDynamicPinata();

      if (!pinata) {
        throw new Error('Failed to initialize Pinata client');
      }

      // Upload to IPFS

      const ipfsResult = await pinata.pinFile({
        data: file.data,
        name: file.name,
        metadata: {
          keyvalues: {
            consent: consent.toString(),
            fileType: file.type,
            fileSize: file.size.toString(),
            ...(metadata as Record<string, string>),
          },
        },
      });

      // Register the IPFS hash with our backend
      const response = await fetch(`${base_url}/registerProducer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          consent,
          data: {
            ipfsHash: ipfsResult.IpfsHash,
            name: file.name,
            type: file.type,
            size: file.size,
            metadata,
          },
          producer,
        }),
      });

      uploadResult = await response.json();
    }
    // If JSON data was provided directly
    else if (data) {
      const response = await fetch(`${base_url}/registerProducer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ consent, data, producer }),
      });

      uploadResult = await response.json();
    } else {
      throw new Error('No file or data provided');
    }

    // Refresh events
    try {
      await fetch(`${base_url}/refreshEvents`);
    } catch (refreshError) {
      console.error('Failed to refresh events:', refreshError);
    }

    // Revalidate the files page to show the new upload
    revalidatePath('/files');

    return uploadResult;
  } catch (e) {
    console.error('Upload error:', e);
    return { error: e instanceof Error ? e.message : 'Internal Server Error' };
  }
};

export const getRecord = async () => {
  const response = await fetch(`${base_url}/getProducerRecord?producer=${producer}&recordId=${recordId}`);

  const data = await response.json();

  return data;
};

export const readLatestCompletedRecord = async () => {
  const response = await fetch(`${base_url}/getCompletedBlocks`, { next: { revalidate: 60 } });
  const data = await response.json();

  return data;
};

export const getRecordCount = async () => {
  const response = await fetch(`${base_url}/getTotalRecordsCount`);
  const data = await response.json();

  return data;
};

export const getProducerRecordCount = async () => {
  const response = await fetch(`${base_url}/getProducerRecordCount?producer=${producer}`);
  const data = await response.json();
  return data;
};

export const getProducerRecords = async () => {
  const response = await fetch(`${base_url}/getProducerRecords?producer=${producer}`, { cache: 'no-store' });
  const data = await response.json();
  return data;
};
