import { Interface, InterfaceAbi, CallExceptionError } from 'ethers';

/**
 * Decodes an error from a smart contract call using the provided ABI.
 *
 * This function takes an ABI and an error object from a smart contract call,
 * and decodes the error data to provide a more human-readable format. It extracts
 * the name, arguments, and signature of the error for further handling.
 *
 * @param {InterfaceAbi} abi - The ABI (Application Binary Interface) of the smart contract.
 * @param {CallExceptionError} error - The error object thrown by the smart contract call,
 * which includes the error data to be decoded.
 *
 * @returns {{ name: string; args: any[]; signature: string }} An object containing
 * the name of the error, its arguments, and the error's signature.
 *
 * @throws Will throw an error if the error data cannot be decoded.
 *
 * @example
 * const errorResponse = { data: '0x12345678' }; // Example error data
 * const decodedError = decodeError(contractAbi, errorResponse);
 * console.log(decodedError.name); // Output: 'SomeError'
 * console.log(decodedError.args); // Output: ['arg1', 'arg2']
 * console.log(decodedError.signature); // Output: '0x...'
 */
export const decodeError = (
  abi: InterfaceAbi,
  error: CallExceptionError
): {
  name: string;
  args: any[];
  signature: string;
} => {
  const iface = new Interface(abi);
  const decoded = iface.parseError(error.data);

  return {
    name: decoded.fragment.name,
    args: decoded.args,
    signature: decoded.fragment.format(),
  };
};
