import { wallet } from './provider';

/**
 * Sign a message with the Ethereum wallet.
 *
 * This function takes a string message as input and uses the connected wallet to
 * generate a digital signature. The signature can be used to verify the authenticity
 * of the message by proving that it was signed by the holder of the corresponding
 * private key.
 *
 * @param {string} data - The message to be signed.
 * @returns {Promise<string>} - A promise that resolves to the digital signature of the message.
 * @throws {Error} - Throws an error if the signing process fails.
 */
export const sign = (data: string): Promise<string> => {
  return wallet.signMessage(data);
};
