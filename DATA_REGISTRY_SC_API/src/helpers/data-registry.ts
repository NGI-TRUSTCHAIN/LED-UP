import { Contract } from 'ethers';
import { signer } from './get-signer';
import { DATA_REGISTRY_CONTRACT_ADDRESS } from '../constants';
import { DataRegistryABI } from '../utils/dataRegistry.abi';

const contract = new Contract(DATA_REGISTRY_CONTRACT_ADDRESS, DataRegistryABI, signer);

export default contract;
