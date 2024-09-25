import { wallet } from './provider';

export const sign = (data: string) => {
  console.log('Signing data', data);
  return wallet.signMessage(data);
};
