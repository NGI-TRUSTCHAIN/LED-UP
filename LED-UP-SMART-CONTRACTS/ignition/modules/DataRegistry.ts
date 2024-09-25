import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import { createHash } from 'crypto';

const MyNFTModule = buildModule('DataRegistry', (m) => {
  const initParams = [
    {
      url: 'https://example.com',
      hash: createHash('sha256').update('https://example.com').digest('hex'),
    },
    {
      schema_ref: {
        url: 'https://example.com',
        hash: createHash('sha256').update('https://example.com').digest('hex'),
      },
    },
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  ];
  const myNFT = m.contract('DataRegistry', [...initParams]);

  return { myNFT };
});

export default MyNFTModule;
