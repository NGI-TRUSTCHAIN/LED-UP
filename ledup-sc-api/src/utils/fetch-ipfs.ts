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
    // const res = await axios.get(`https://azure-historical-fox-538.mypinata.cloud/ipfs/${hash}`, {
    //   headers: {
    //     'x-pinata-gateway-token': 'hc1qbCgOlRZ8l3zW2RBr0-3lKvYboEEVKGkz1Jg4xjJnydVuSZUhRiLTfWAFSwFd',
    //   },
    // });
    // const res = await axios.get(`https://ipfs.io/ipfs/${hash}`);
    const res = await axios.get(`https://cloudflare-ipfs.com/ipfs/${cid}`);
    // const res = await axios.get(`https://gateway.pinata.cloud/ipfs/${cid}`);

    return res.data;
  } catch (error) {
    throw error;
  }
};

// fetchFromIPFS('QmdW7QFAqKvD2vhFh9BZjV8djBQKhFnSawSCGtskm6i8d5');

// 1.   bafkreiekovuhb64ovjaxzmxuxbejgd3vzx4cti7q7ghylmdnbvzahkxjb4"
// 2.   bafkreihxly26kk4d6aroutt5cn3c6kju3cnyh3soy2vfpoli64tb5debuy
// 3.   QmWiVQH5xU7ojS6kmE7zFycL5ypQe2pZGr368wQtLt8Pip
// 4.   QmdW7QFAqKvD2vhFh9BZjV8djBQKhFnSawSCGtskm6i8d5
