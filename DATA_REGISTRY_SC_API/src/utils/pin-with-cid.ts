const axios = require('axios');

const JWT = 'YOUR_PINATA_JWT';
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
