import { provider } from './provider';

/**
 * Fetches the balance of a specified Ethereum address.
 *
 * This asynchronous function retrieves the balance for a given Ethereum address
 * using the connected provider. It handles potential errors during the fetch process,
 * logging the error to the console and rethrowing it for further handling.
 *
 * @param {string} address - The Ethereum address for which to fetch the balance.
 * @returns {Promise<BigNumber>} A promise that resolves to the balance of the specified address.
 *
 * @throws Will throw an error if the balance retrieval fails.
 *
 * @example
 * const address = '0x1234567890abcdef1234567890abcdef12345678';
 * getBalance(address)
 *   .then(balance => console.log(`Balance: ${balance.toString()}`))
 *   .catch(error => console.error('Error fetching balance:', error));
 */
const getBalance = async (address: string) => {
  try {
    const balance = await provider.getBalance(address);
    return balance;
  } catch (error) {
    console.error('An error occurred while getting the balance:', error);
    throw error;
  }
};

export default getBalance;
