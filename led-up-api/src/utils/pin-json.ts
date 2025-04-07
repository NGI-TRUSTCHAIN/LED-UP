import axios from 'axios';

const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;
const API_JWT = process.env.API_JWT;

const GATEWAY_URL = process.env.GATEWAY_URL;

/**
 * Uploads JSON data to IPFS using Pinata's pinning service.
 *
 * This function takes a JavaScript object, converts it to a JSON string, and sends a POST request
 * to Pinata's API to pin the JSON data to IPFS. The function logs the response data from the API
 * and returns it for further use.
 *
 * @param {any} data - The JavaScript object to be uploaded as JSON to IPFS.
 *
 * @returns {Promise<any>} A promise that resolves to the response data from the IPFS API.
 *
 * @throws Will log an error and throw if the upload process fails.
 *
 * @example
 * const jsonData = { name: 'Example', description: 'This is an example.' };
 * uploadToIPFS(jsonData)
 *   .then(response => console.log('Upload successful:', response))
 *   .catch(error => console.error('Upload failed:', error));
 */
export const uploadToIPFS = async (data: any) => {
  try {
    const res = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_JWT}`,
      },
    });

    console.log(res.data);

    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
