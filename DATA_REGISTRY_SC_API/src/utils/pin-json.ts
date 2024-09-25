const API_KEY = '03b53addb03ac8c8e852';
const API_SECRET = '3a301e7a333ec070ffbc9aa1b6360f386bd7d1b1b1ce91737ab09ca880371126';
const API_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJiYmMzZDYyOC04ZGQyLTRiMjAtYmFlZC03N2RjNzRhYmVlNjkiLCJlbWFpbCI6Im1mLnNlbGFtbUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiMDNiNTNhZGRiMDNhYzhjOGU4NTIiLCJzY29wZWRLZXlTZWNyZXQiOiIzYTMwMWU3YTMzM2VjMDcwZmZiYzlhYTFiNjM2MGYzODZiZDdkMWIxYjFjZTkxNzM3YWIwOWNhODgwMzcxMTI2IiwiZXhwIjoxNzUyNTYzODYzfQ.6BuZ9slLFBGYWRu0WAnBPakQX-gtETL1kxYV5tVeHM0';
const GATEWAY_URL = 'https://azure-historical-fox-538.mypinata.cloud';
import axios from 'axios';

/**
 * Function to upload data to IPFS.
 *
 * @param {any} data - The data to be uploaded.
 * @return {Promise} A promise that resolves with the uploaded data.
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
