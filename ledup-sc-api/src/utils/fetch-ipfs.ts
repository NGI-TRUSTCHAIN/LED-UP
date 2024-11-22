import axios from 'axios';

/**
 * Fetches data from IPFS (InterPlanetary File System) using the provided CID (Content Identifier).
 *
 * This function retrieves the data from an IPFS gateway (in this case, Cloudflare) using the specified CID.
 * It attempts to fetch the data from a specific gateway and returns the result.
 * If the fetch operation fails, it throws an error.
 *
 * @param {string} cid - The Content Identifier (CID) for the data stored on IPFS.
 *
 * @returns {Promise<any>} A promise that resolves with the fetched data from IPFS.
 *
 * @throws Will throw an error if the request to the IPFS gateway fails.
 *
 * @example
 * const cid = "QmXoYPpmyZQ9bDJo2p7e7bKvxAGF5J8ayvKv1X9BZySLxy";
 * fetchFromIPFS(cid)
 *   .then(data => console.log(data))
 *   .catch(error => console.error('Failed to fetch data from IPFS:', error));
 */
export const fetchFromIPFS = async (cid: string) => {
  try {
    // const res = await axios.get(`https://azure-historical-fox-538.mypinata.cloud/ipfs/${cid}`, {
    //   headers: {
    //     'x-pinata-gateway-token': 'x-pinata-gateway-token',
    //   },
    // });
    const res = await axios.get(`https://gateway.pinata.cloud/ipfs/${cid}`);

    return res.data;
  } catch (error) {
    throw error;
  }
};
