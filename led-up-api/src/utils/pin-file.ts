import * as fs from 'fs';

import axios from 'axios';
import FormData from 'form-data';

const JWT = process.env.PINATA_JWT;
/**
 * Uploads a file to IPFS using Pinata's pinning service.
 *
 * This function reads a file from the specified path, creates a form with metadata and pinning options,
 * and sends a request to Pinata's API to upload the file to IPFS. The file is pinned on IPFS for long-term storage.
 *
 * @param {string} path - The local file path to be uploaded to IPFS.
 *
 * @returns {Promise<any>} A promise that resolves with the response data from Pinata, including the IPFS CID (Content Identifier).
 *
 * @throws Will throw an error if the upload process fails.
 *
 * @example
 * const filePath = "/path/to/file.txt";
 * uploadToIPFS(filePath)
 *   .then(data => console.log('File uploaded to IPFS:', data))
 *   .catch(error => console.error('IPFS upload failed:', error));
 */
export const uploadFileToIPFS = async (path: string): Promise<any> => {
  const formData = new FormData();

  const file = fs.createReadStream(path);
  formData.append('file', file);

  const pinataMetadata = JSON.stringify({
    name: 'HistoricalData',
  });

  formData.append('providerName', pinataMetadata);

  const pinataOptions = JSON.stringify({
    cidVersion: 1,
  });

  formData.append('pinataOptions', pinataOptions);

  const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
    headers: {
      'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
      Authorization: `Bearer ${JWT}`,
    },
  });

  return res.data;
};
