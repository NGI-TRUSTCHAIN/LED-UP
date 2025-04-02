import { Contract } from 'ethers';

import { signer } from './get-signer';
import { ERC20ABI } from '../abi';
import { TOKEN_CONTRACT_ADDRESS } from '../constants';

const erc20 = new Contract(TOKEN_CONTRACT_ADDRESS, ERC20ABI, signer);

export default erc20;
