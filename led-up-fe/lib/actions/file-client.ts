'use client';

const producer = '0x7bE129dc9F7715f51D459c36bB127Cc2FaE98B32'; //hardcoded to single address
const recordId = 'd0658788-9eeb-4b40-9053-09e1adacdf6a'; //hardcoded to single record id

const base_url = process.env.NEXT_PUBLIC_FILE_API_URL || 'http://localhost:7071/api';

enum ConsentStatus {
  Allowed = 0, // Consent is granted
  Denied = 1, // Consent is denied
  NotSet = 2, // Consent is pending
}

// Client-side API functions for use in components
// Import the mock functions directly to avoid any Pinata imports at build time
import { mockListFiles, mockRetrieveFile } from './pinata-client';

export async function retrieveFileClient(cid: string) {
  try {
    // For client-side fetching, use a gateway URL directly
    const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;
    const response = await fetch(gatewayUrl);

    if (!response.ok) {
      // Fall back to mock data if the fetch fails
      return mockRetrieveFile(cid);
    }

    return response;
  } catch (error) {
    console.error('Error retrieving file:', error);
    // Return mock data in case of error
    return mockRetrieveFile(cid);
  }
}

export async function listFilesClient() {
  try {
    // Use mock data directly - in production, this could use our safer Pinata methods
    return mockListFiles();
  } catch (error) {
    console.error('Error listing files:', error);
    return { items: [], count: 0 };
  }
}

export async function uploadClient(data: unknown, consent: ConsentStatus = ConsentStatus.Allowed) {
  try {
    const response = await fetch(`/api/files/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        consent,
        data,
        producer,
      }),
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading file:', error);
    return { error: error instanceof Error ? error.message : 'Upload failed' };
  }
}

export async function readLatestCompletedRecordClient() {
  try {
    // Try to fetch real data from the API
    try {
      // First try to get real data from the API
      const response = await fetch(`${base_url}/getCompletedBlocks`, {
        cache: 'no-store',
        next: { revalidate: 0 }, // Ensure we get fresh data
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();

      if (result && result.data && Array.isArray(result.data)) {
        return result;
      }

      // If the API returned empty or invalid data, throw an error to fall back to mock data
      throw new Error('No data returned from API');
    } catch (apiError) {
      console.warn('Error fetching data from API, using mock data instead:', apiError);

      // If real API call fails, return mock data for demo purposes
      // In production, you might want to show a more specific error
      return {
        data: [
          {
            id: '1',
            eName: 'Patient Record',
            args: JSON.stringify(['patient1', 'data', 'meta', 'ipfs://QmExample1']),
            blockNumber: '12345678',
          },
          {
            id: '2',
            eName: 'Medical Scan',
            args: JSON.stringify(['patient2', 'scan', 'meta', 'ipfs://QmExample2']),
            blockNumber: '12345679',
          },
          // Add your newly uploaded file as a mock entry for testing
          {
            id: '3',
            eName: 'Uploaded File',
            args: JSON.stringify(['user', 'upload', 'Your recently uploaded file', 'ipfs://YourUploadedFileHash']),
            blockNumber: '12345680',
          },
        ],
      };
    }
  } catch (error) {
    console.error('Error in readLatestCompletedRecordClient:', error);
    return { data: [] };
  }
}

export async function getRecordClient() {
  try {
    // This would call your backend in production
    return {
      record: {
        id: recordId,
        data: 'Sample record data',
        status: 'active',
      },
    };
  } catch (error) {
    console.error('Error getting record:', error);
    return { error: 'Failed to get record' };
  }
}

export async function getProducerRecordsClient() {
  try {
    // Mock data for demo
    return {
      data: [
        { id: '1', name: 'Record 1', status: 'Complete' },
        { id: '2', name: 'Record 2', status: 'Pending' },
      ],
    };
  } catch (error) {
    console.error('Error getting producer records:', error);
    return { data: [] };
  }
}
