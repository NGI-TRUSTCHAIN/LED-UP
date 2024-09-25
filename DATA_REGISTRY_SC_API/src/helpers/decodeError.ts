import { Interface, InterfaceAbi, CallExceptionError } from 'ethers';

export const decodeError = (abi: InterfaceAbi, error: CallExceptionError) => {
  const iface = new Interface(abi);
  const decoded = iface.parseError(error.data);
  return {
    name: decoded.fragment.name,
    args: decoded.args,
    signature: decoded.fragment.format(),
  };
};
