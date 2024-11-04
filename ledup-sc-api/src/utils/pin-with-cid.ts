const axios = require('axios');

const JWT = process.env.PINATA_JWT;

/**
 * Pins an existing IPFS file using its CID (Content Identifier) to Pinata's service.
 *
 * This function takes a CID, constructs a request payload to pin the file associated with that
 * CID, and sends a POST request to Pinata's API. This allows the user to pin files that are
 * already available on IPFS, ensuring their persistence.
 *
 * @param {string} cid - The CID of the IPFS file to be pinned.
 *
 * @returns {Promise<any>} A promise that resolves to the response data from the Pinata API.
 *
 * @throws Will throw an error if the pinning process fails.
 *
 * @example
 * const cid = 'Qm...'; // Replace with a valid CID
 * uploadWithCid(cid)
 *   .then(response => console.log('File pinned:', response))
 *   .catch(error => console.error('Pinning failed:', error));
 */

export const uploadWithCid = async (cid: string) => {
  const data = JSON.stringify({
    hashToPin: cid,
  });

  const res = await axios.post('https://api.pinata.cloud/pinning/pinByHash', {
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      Authorization: `Bearer ${JWT}`,
    },
    body: data,
  });
};
