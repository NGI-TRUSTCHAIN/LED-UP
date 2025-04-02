import axios from 'axios';

const PINATA_JWT = process.env.PINATA_JWT;
const PIN_QUERY = `https://api.pinata.cloud/data/pinList?status=pinned&pageLimit=1000&includeCount=false`;

const wait = (milliseconds: number) => {
  return new Promise(resolve => {
    setTimeout(resolve, milliseconds);
  });
};

/**
 * Fetches all pinned IPFS files from Pinata's service.
 *
 * This function retrieves the list of pinned files by making multiple requests to Pinata's API,
 * handling pagination as necessary. It accumulates the IPFS pin hashes from each response
 * until all available pins have been fetched.
 *
 * @returns {Promise<string[]>} A promise that resolves to an array of IPFS pin hashes.
 *
 * @throws Will log an error if the fetching process fails.
 *
 * @example
 * fetchPins()
 *   .then(pins => console.log('Fetched pins:', pins))
 *   .catch(error => console.error('Fetching pins failed:', error));
 */
export const fetchPins = async () => {
  try {
    console.log('Fetching pins...');
    const pinHashes = [];
    let pageOffset = 0;
    let hasMore = true;

    while (hasMore === true) {
      try {
        const response = await axios.get(`${PIN_QUERY}&pageOffset=${pageOffset}`, {
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${PINATA_JWT}`,
          },
        });
        const responseData = await response.data();
        const rows = responseData.rows;

        if (rows.length === 0) {
          hasMore = false;
        }
        const itemsReturned = rows.length;
        pinHashes.push(...rows.map((row: any) => row.ipfs_pin_hash));
        pageOffset += itemsReturned;
        await wait(300);
      } catch (error) {
        console.log(error);
        break;
      }
    }

    console.log('Total pins fetched: ', pinHashes.length);
    return pinHashes;
  } catch (error) {
    console.log(error);
  }
};

/**
 * Unpins a file from Pinata's service using its IPFS hash.
 *
 * This function sends a DELETE request to Pinata's API to remove a specific pin identified
 * by its IPFS hash. Successful deletion will log a message to the console.
 *
 * @param {string} hash - The IPFS hash of the file to be unpinned.
 *
 * @returns {Promise<void>} A promise that resolves when the unpinning process is complete.
 *
 * @throws Will log an error and rethrow it if the unpinning process fails.
 *
 * @example
 * const hashToUnpin = 'Qm...'; // Replace with a valid IPFS hash
 * unpin(hashToUnpin)
 *   .then(() => console.log('File unpinned successfully'))
 *   .catch(error => console.error('Unpinning failed:', error));
 */
export const unpin = async (hash: string) => {
  try {
    const res = await axios.delete(`https://api.pinata.cloud/pinning/unpin/${hash}`, {
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
    });
    console.log(`Pins: ${hash}  deleted`);
  } catch (error) {
    console.log(error);
    throw error;
  }
};
