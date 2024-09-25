import { wallet } from '../helpers/provider';
export const calculateSignature = async (data: string): Promise<string> => {
  try {
    return await wallet.signMessage(data);
  } catch (error: any) {
    throw new Error(`Failed to calculate signature: ${error.message}`);
  }
};
