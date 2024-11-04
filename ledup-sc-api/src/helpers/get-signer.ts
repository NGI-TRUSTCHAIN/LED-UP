import { provider, wallet } from './provider';

/**
 * Connects a wallet to a specified provider to create a signer instance.
 *
 * This constant creates a signer by connecting the specified wallet to the provided
 * Ethereum provider. The signer can be used to sign transactions and messages, as well as
 * send transactions to the blockchain.
 *
 * @const {Signer} signer - The signer instance connected to the wallet and provider.
 *
 * @example
 * // Usage example:
 * const tx = {
 *   to: '0xabcdefabcdefabcdefabcdefabcdefabcdef',
 *   value: ethers.utils.parseEther('0.1'),
 * };
 * const transactionResponse = await signer.sendTransaction(tx);
 * console.log('Transaction response:', transactionResponse);
 */
export const signer = wallet.connect(provider);
