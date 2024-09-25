import { signer } from './get-signer';
import DataRegistry from './data-registry';
import Compensation from './compensation';
import { ConsentStatus, Metadata, RecordInfo, RecordStatus, RegRecord } from '../types';

const callContract = async (query: string) => {
  const ContractWithSigner = DataRegistry.connect(signer);

  const providerData = await DataRegistry.getProviderMetadata();

  const schema = await DataRegistry.getRecordSchema();

  return ContractWithSigner;
};

export default callContract;

export const getProviderMetadata = async (): Promise<Metadata> => {
  return await DataRegistry.getProviderMetadata();
};

export const getProducerConsent = async (_address: string): Promise<ConsentStatus> => {
  return await DataRegistry.getProducerConsent(_address);
};

export const getProducerRecord = async (_producer: string, _recordId: string): Promise<RegRecord> => {
  return await DataRegistry.getProducerRecord(_producer, _recordId);
};

export const getProducerRecordCount = async (_producer: string): Promise<number> => {
  return await DataRegistry.getProducerRecordCount(_producer);
};

export const getProducerRecordInfo = async (_address: string): Promise<RecordInfo> => {
  return await DataRegistry.getProducerRecordInfo(_address);
};

export const getProducerRecordStatus = async (_producer: string): Promise<RecordStatus> => {
  return await DataRegistry.getProducerRecordStatus(_producer);
};

export const getRecordSchema = async (): Promise<Metadata> => {
  return await DataRegistry.getRecordSchema();
};

export const getTotalRecordsCount = async (): Promise<number> => {
  return await DataRegistry.getTotalRecordsCount();
};

export const getProvider = async (): Promise<string> => {
  return await DataRegistry.owner();
};

export const producerExists = async (_producer: string): Promise<boolean> => {
  return await DataRegistry.producerExists(_producer);
};

export const paused = async (): Promise<boolean> => {
  return await DataRegistry.paused();
};

export const getCompensationContractAddress = async (): Promise<string> => {
  return await DataRegistry.getCompensationContractAddress();
};

// Compensation smart contract functions

export const verifyPayment = async (recordId: string) => {
  const payed = await Compensation.verifyPayment(recordId);
  return { isPayed: payed };
};
export const getServiceFee = async () => {
  const serviceFee = await Compensation.getServiceFee();
  return { serviceFee: Number(serviceFee) };
};

export const getLeveaWallet = async () => {
  const leveaWallet = await Compensation.getLeveaWallet();
  return { leveaWallet };
};

export const getLeveaWalletBalance = async () => {
  const balance = await Compensation.getLeveaWalletBalance();
  return { balance: Number(balance) };
};

// export const getProducerBalance = async () => {
//   const balance = await Compensation.getProducerBalance();
//   return { balance: Number(balance) };
// };

export const getProducerBalanceByOwner = async (producerAddress: string) => {
  console.info('getProducerBalanceByOwner', producerAddress);
  const balance = await Compensation['getProducerBalance(address)'](producerAddress);
  return { balance: Number(balance) };
};

export const getMinimumWithdrawAmount = async () => {
  const amount = await Compensation.getMinimumWithdrawAmount();
  return { minimumWithdrawAmount: Number(amount) };
};

export const getUnitPrice = async () => {
  const unitPrice = await Compensation.getUnitPrice();
  return { unitPrice: Number(unitPrice) };
};

export const getPaymentTokenAddress = async () => {
  const tokenAddress = await Compensation.getPaymentTokenAddress();
  return { tokenAddress };
};

export const producerExist = async (producerAddress: string) => {
  const exists = await Compensation.producerExist(producerAddress);
  return { exists };
};
