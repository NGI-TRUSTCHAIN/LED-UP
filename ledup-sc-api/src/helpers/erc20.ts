import { Contract } from 'ethers';
import { erc20ABI } from './../utils/erc20.abi';
import { signer } from './get-signer';
import { TOKEN_ADDRESS } from '../constants';

const erc20 = new Contract(TOKEN_ADDRESS, erc20ABI, signer);

export default erc20;
