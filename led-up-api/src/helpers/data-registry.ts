import { Contract } from 'ethers';

import { signer } from './get-signer';
import { DataRegistryABI } from '../abi/data-registry.abi';
import { DATA_REGISTRY_CONTRACT_ADDRESS } from '../constants';

const contract = new Contract(DATA_REGISTRY_CONTRACT_ADDRESS, DataRegistryABI, signer);

export default contract;
