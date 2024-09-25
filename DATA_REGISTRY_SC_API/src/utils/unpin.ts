const PINATA_JWT = 'YOUR_JWT_HERE';
const PIN_QUERY = `https://api.pinata.cloud/data/pinList?status=pinned&pageLimit=1000&includeCount=false`;
import axios from 'axios';

const wait = (milliseconds: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
};

export const fetchPins = async () => {
  try {
    console.log('Fetching pins...');
    let pinHashes = [];
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
