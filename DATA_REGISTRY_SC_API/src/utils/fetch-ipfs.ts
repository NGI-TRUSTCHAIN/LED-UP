import axios from 'axios';

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
