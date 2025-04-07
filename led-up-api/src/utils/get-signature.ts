import { wallet } from '../helpers/provider';

/**
 * Calculates the cryptographic signature of a given string using the wallet's private key.
 *
 * This function signs the provided data (string) using the wallet's private key and returns
 * the resulting signature. It is typically used for proving ownership or integrity of data
 * in blockchain or cryptographic applications.
 *
 * @param {string} data - The data to be signed, provided as a string.
 *
 * @returns {Promise<string>} A promise that resolves with the calculated signature in hexadecimal format.
 *
 * @throws Will throw an error if the signature calculation fails.
 *
 * @example
 * const data = "Important message to sign";
 * calculateSignature(data)
 *   .then(signature => console.log(signature))
 *   .catch(error => console.error('Signature calculation failed:', error));
 */
export const calculateSignature = async (data: string): Promise<string> => {
  try {
    return await wallet.signMessage(data);
  } catch (error: any) {
    throw new Error(`Failed to calculate signature: ${error.message}`);
  }
};
