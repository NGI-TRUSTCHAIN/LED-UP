// const { expect } = require('chai');
// const hre = require('hardhat');
// const { loadFixture } = require('@nomicfoundation/hardhat-toolbox/network-helpers');
// import { createHash } from 'crypto';

// describe('Data Registry Contract', function () {
//   async function DataRegistryFixture() {
//     const [deployer, leveaWallet] = await hre.ethers.getSigners();

//     const Token = await hre.ethers.getContractFactory('LedUpToken');
//     const token = await Token.deploy('LedUpToken', 'LUT');

//     const metadataUrl = {
//       url: 'https://example.com',
//       hash: `0x${createHash('sha256').update('https://example.com').digest('hex')}`,
//     };

//     const schemaRef = {
//       schemaRef: {
//         url: 'https://example.com',
//         hash: `0x${createHash('sha256').update('https://example.com').digest('hex')}`,
//       },
//     };

//     const dataRegistry = await hre.ethers.deployContract('DataRegistry', [
//       metadataUrl,
//       schemaRef,
//       deployer,
//       token,
//       leveaWallet,
//       10,
//     ]);

//     return { dataRegistry, deployer, token, metadataUrl, schemaRef, leveaWallet };
//   }

//   it('Should set the owner correctly', async function () {
//     const { dataRegistry, deployer } = await loadFixture(DataRegistryFixture);
//     console.log(await dataRegistry.owner());

//     expect(await dataRegistry.owner()).to.be.equal(deployer.address);
//   });

//   it('Should set the metadata correctly', async function () {
//     const data = await loadFixture(DataRegistryFixture);
//     const schemaRef = await data.dataRegistry.getRecordSchema();
//     console.log(schemaRef[0][0]);

//     expect(schemaRef[0][0]).to.be.equal(data.schemaRef.schemaRef.url);
//     expect(schemaRef[0][1]).to.be.equal(data.schemaRef.schemaRef.hash);
//   });
// });
