import { Contract } from 'ethers';
import { CompensationABI } from '../utils/compensation.abi';
import { signer } from './get-signer';
import { COMPENSATION_CONTRACT_ADDRESS } from '../constants';

const compensationContract = new Contract(COMPENSATION_CONTRACT_ADDRESS, CompensationABI, signer);

export default compensationContract;
