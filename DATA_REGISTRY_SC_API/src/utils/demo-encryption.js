const API_KEY = '03b53addb03ac8c8e852';
const API_SECRET = '3a301e7a333ec070ffbc9aa1b6360f386bd7d1b1b1ce91737ab09ca880371126';
const API_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJiYmMzZDYyOC04ZGQyLTRiMjAtYmFlZC03N2RjNzRhYmVlNjkiLCJlbWFpbCI6Im1mLnNlbGFtbUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiMDNiNTNhZGRiMDNhYzhjOGU4NTIiLCJzY29wZWRLZXlTZWNyZXQiOiIzYTMwMWU3YTMzM2VjMDcwZmZiYzlhYTFiNjM2MGYzODZiZDdkMWIxYjFjZTkxNzM3YWIwOWNhODgwMzcxMTI2IiwiZXhwIjoxNzUyNTYzODYzfQ.6BuZ9slLFBGYWRu0WAnBPakQX-gtETL1kxYV5tVeHM0';
const GATEWAY_URL = 'https://azure-historical-fox-538.mypinata.cloud';
// import axios from 'axios';
// import FormData from 'form-data';

const axios = require('axios');
const FormData = require('form-data');

const fs = require('fs');
const JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJiYmMzZDYyOC04ZGQyLTRiMjAtYmFlZC03N2RjNzRhYmVlNjkiLCJlbWFpbCI6Im1mLnNlbGFtbUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJpZCI6IkZSQTEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX0seyJpZCI6Ik5ZQzEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiMWEyMTRmN2JmNGNlZTUxMjYxOWMiLCJzY29wZWRLZXlTZWNyZXQiOiIwMjMzYThkYjBlMzUwMzEwNzI3ZjMxNDA4ZWYwODJhNDA4NTEyNDY1ZmQ0MGU4ZmEwMGNjZWJiMzcyZmU1MzcwIiwiaWF0IjoxNzIxMDI3NDUyfQ.tPgghscQzD5D4swrf2XNplw-2Ih6-gxtaOg0Zty1ez4';

const uploadToIPFS = async (path) => {
  try {
    const formData = new FormData();

    const file = fs.createReadStream(path);
    formData.append('file', file);

    const providerMetadata = JSON.stringify({
      name: 'Health Provider Name',
    });

    formData.append('providerName', providerMetadata);

    const pinataOptions = JSON.stringify({
      cidVersion: 1,
    });

    formData.append('pinataOptions', pinataOptions);

    const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
      headers: {
        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
        Authorization: `Bearer ${JWT}`,
      },
    });
    console.log(res.data);

    return res.data;
  } catch (error) {
    throw error;
  }
};

uploadToIPFS({
  encryptedData: '123',
  iv: '123',
  tag: '123',
});
