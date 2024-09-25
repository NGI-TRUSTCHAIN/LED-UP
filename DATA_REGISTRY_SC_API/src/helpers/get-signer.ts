import { provider, wallet } from './provider';

export const signer = wallet.connect(provider);
