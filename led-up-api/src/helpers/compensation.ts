import { Contract } from 'ethers';

import { signer } from './get-signer';
import { CompensationABI } from '../abi/compensation.abi';
import { COMPENSATION_CONTRACT_ADDRESS } from '../constants';

const compensationContract = new Contract(COMPENSATION_CONTRACT_ADDRESS, CompensationABI, signer);

export default compensationContract;
