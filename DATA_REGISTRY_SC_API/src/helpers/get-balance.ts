import { provider } from './provider';

const getBalance = async (address: string) => {
  try {
    const balance = await provider.getBalance(address);
    return balance;
  } catch (error) {
    console.error('An error occurred while getting the balance:', error);
    throw error;
  } finally {
    // TODO
  }
};

export default getBalance;
