import { PinataSDK } from 'pinata';

import { encrypt, decrypt, toCipherKey } from '@/utils/encrypt';

/**
 * Service class for handling IPFS (InterPlanetary File System) operations.
 * This service provides methods for uploading, retrieving, and deleting data from IPFS,
 * as well as handling encryption and decryption of the data.
 */
export class IPFSService {
  private readonly apiJwt: string;
  private readonly gatewayUrl: string;
  private readonly encryptionKey: string;
  private pinata: PinataSDK;

  /**
   * Creates a new instance of the IPFSService.
   */
  constructor() {
    this.apiJwt = process.env.NEXT_PUBLIC_PINATA_API_JWT!;
    this.gatewayUrl = process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL!;
    this.encryptionKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY!;

    // Initialize the Pinata SDK with JWT authentication
    this.pinata = new PinataSDK({
      pinataJwt: this.apiJwt,
      pinataGateway: this.gatewayUrl,
    });
  }

  /**
   * Fetches data from IPFS using the provided CID (Content Identifier).
   *
   * @param {string} cid - The Content Identifier for the data stored on IPFS.
   * @returns {Promise<any>} A promise that resolves with the fetched data from IPFS.
   * @throws Will throw an error if the request to the IPFS gateway fails.
   */
  async fetchFromIPFS(cid: string): Promise<any> {
    try {
      const res = await this.pinata.gateways.public.get(cid);
      return res;
    } catch (error) {
      console.error(`Error fetching data from IPFS with CID ${cid}:`, error);
      throw error;
    }
  }

  /**
   * Uploads JSON data to IPFS using Pinata's pinning service.
   *
   * @param {any} data - The data object to be uploaded to IPFS.
   * @param {string} resourceType - The type of resource being uploaded.
   * @returns {Promise<any>} A promise that resolves to the response data from the IPFS API.
   * @throws Will throw an error if the upload process fails.
   */
  async uploadToIPFS(data: any, resourceType: string): Promise<any> {
    console.log(`Uploading ${resourceType} data to IPFS using Pinata SDK v2.0.1...`);

    // Try to use the Pinata SDK's upload.json method
    try {
      // Upload the JSON data using the SDK
      const response = await this.pinata.upload.public.json(data, {
        metadata: {
          name: `${resourceType}-${Date.now()}`,
          keyvalues: {
            cidVersion: '1',
          },
        },
      });
      console.log('Pinata SDK upload response:', response);

      if (response && response.cid) {
        return {
          cid: response.cid,
          url: `${this.gatewayUrl}/${response.cid}`,
          timestamp: new Date().toISOString(),
          pinSize: response.size || 0,
          isDuplicate: false,
        };
      } else {
        console.error('Invalid response format from Pinata SDK:', response);
        throw new Error('Invalid response format from Pinata SDK');
      }
    } catch (sdkError) {
      console.error('Error using Pinata SDK:', sdkError);
      throw sdkError;
    }
  }

  /**
   * Unpins (deletes) data from IPFS using the provided CID.
   *
   * @param {string[]} cid - The Content Identifier for the data to be unpinned.
   * @returns {Promise<any>} A promise that resolves to the response data from the IPFS API.
   * @throws Will throw an error if the unpin process fails.
   */
  async unpinFromIPFS(cid: string[]): Promise<any> {
    try {
      console.log(`Unpinning files with CIDs: ${cid.join(', ')}`);
      // Use the SDK's files.public.delete method for unpinning
      const results = await this.pinata.files.public.delete(cid);
      console.log('Files unpinned successfully');
      return results;
    } catch (error) {
      console.error(`Error unpinning data from IPFS with CID ${cid}:`, error);
      throw error;
    }
  }

  /**
   * Encrypts and uploads data to IPFS.
   *
   * @param {any} data - The data to be encrypted and uploaded.
   * @param {string} resourceType - The type of resource being uploaded.
   * @returns {Promise<any>} A promise that resolves to the response data from the IPFS API.
   * @throws Will throw an error if the encryption or upload process fails.
   */
  async encryptAndUpload(data: any, resourceType: string): Promise<any> {
    try {
      console.log(`Encrypting ${resourceType} data before uploading to IPFS...`);
      const encryptedData = encrypt(JSON.stringify(data), toCipherKey(this.encryptionKey));
      console.log('Data encrypted successfully');

      // Use the updated uploadToIPFS method which has proper error handling
      const res = await this.uploadToIPFS(encryptedData, resourceType);
      console.log(`Data uploaded to IPFS with CID: ${res.cid}`);

      return res;
    } catch (error) {
      console.error('Error encrypting and uploading data to IPFS:', error);
      throw error;
    }
  }

  /**
   * Fetches and decrypts data from IPFS.
   *
   * @param {string} cid - The Content Identifier for the encrypted data.
   * @returns {Promise<{ data: any, raw: any }>} A promise that resolves to an object containing both the decrypted data and the raw encrypted data.
   * @throws Will throw an error if the fetch or decryption process fails.
   */
  async fetchAndDecrypt(cid: string): Promise<{ data: any; raw: any }> {
    try {
      console.log(`Fetching data from IPFS with CID: ${cid}`);
      const encryptedData = await this.fetchFromIPFS(cid);
      console.log('Data fetched successfully, decrypting...');

      // Handle the encryption/decryption type issues by ensuring we have a string
      let dataToDecrypt: string;

      if (typeof encryptedData === 'string') {
        dataToDecrypt = encryptedData;
      } else if (typeof encryptedData === 'object') {
        dataToDecrypt = JSON.stringify(encryptedData);
      } else {
        throw new Error('Unexpected data format from IPFS');
      }

      const decryptedData = decrypt(dataToDecrypt as any, toCipherKey(this.encryptionKey));
      console.log('Data decrypted successfully');

      return {
        data: decryptedData,
        raw: encryptedData,
      };
    } catch (error) {
      console.error(`Error fetching and decrypting data from IPFS with CID ${cid}:`, error);
      throw error;
    }
  }

  /**
   * Handles HTTP requests to retrieve data from IPFS.
   *
   * @param {string} cid - The Content Identifier for the data to retrieve.
   * @returns {Promise<any>} A promise that resolves to an HTTP response.
   */
  async handleGetIPFSData(cid: string): Promise<any> {
    if (!cid) {
      return {
        status: 400,
        message: 'Please provide a cid',
      };
    }

    try {
      const { data, raw } = await this.fetchAndDecrypt(cid);

      return {
        status: 200,
        jsonBody: {
          data: data,
          res: raw,
        },
      };
    } catch (error) {
      console.error(`Error fetching data: ${error}`);
      return {
        status: 500,
        jsonBody: {
          error: error,
          message: 'Failed to retrieve data from IPFS',
        },
      };
    }
  }

  /**
   * Handles HTTP requests to delete data from IPFS.
   *
   * @param {string[]} cid - The Content Identifier for the data to be deleted.
   * @returns {Promise<any>} A promise that resolves to an HTTP response.
   */
  async handleDeleteIPFS(cid: string[]): Promise<any> {
    if (!cid) {
      return {
        status: 400,
        message: 'Please provide a cid',
      };
    }

    try {
      const res = await this.unpinFromIPFS(cid);

      return {
        status: 200,
        data: res,
      };
    } catch (error) {
      console.error(`Error deleting data: ${error}`);
      return {
        status: 500,
        data: {
          error: error,
          message: 'Failed to delete data from IPFS',
        },
      };
    }
  }

  /**
   * Handles HTTP requests to update the blockchain by uploading encrypted data to IPFS.
   *
   * @param {any} data - The data to be encrypted and uploaded.
   * @param {string} name - The name to be associated with the data in IPFS metadata.
   * @returns {Promise<any>} A promise that resolves to an HTTP response.
   */
  async handleUpdateBlockchain(data: any, name: string): Promise<any> {
    try {
      const res = await this.encryptAndUpload(data, name);

      return {
        status: 200,
        data: res,
      };
    } catch (error: any) {
      console.error(`Error Uploading Data: ${error}`);

      return {
        status: 500,
        data: {
          error: error.response ? error.response.data : error.message,
          message: 'Failed to create resource',
        },
      };
    }
  }

  /**
   * Handles HTTP requests to fetch various metadata and blockchain-related data.
   */
  async handleGetData(): Promise<any> {
    try {
      // This method would need to be implemented with the specific blockchain interactions
      // that were in the original getData.ts file
      return {
        status: 200,
        jsonBody: {
          message: 'This method needs to be implemented with specific blockchain interactions',
        },
      };
    } catch (error) {
      console.error(`Error fetching data: ${error}`);

      return {
        status: 500,
        jsonBody: {
          error: error instanceof Error ? error.message : 'Unknown error',
          message: 'Failed to retrieve data',
        },
      };
    }
  }
}

// Export a singleton instance of the service
export const ipfsService = new IPFSService();
