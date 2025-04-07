import Compensation from './compensation';
import DataRegistry from './data-registry';
import { signer } from './get-signer';
import {
  ConsentStatus,
  Metadata,
  ProducerRecords,
  RecordInfo,
  RecordStatus,
  RegRecord,
} from '../types';

/**
 * Calls the contract with the provided query.
 *

 * @returns {Promise<ContractWithSigner>} - A promise that resolves to the connected contract instance.
 */
const callContract = async (): Promise<any> => {
  const ContractWithSigner = DataRegistry.connect(signer);
  await DataRegistry.getProviderMetadata();
  await DataRegistry.getRecordSchema();

  return ContractWithSigner;
};

export default callContract;

/**
 * Retrieves the provider metadata from the Data Registry contract.
 *
 * @returns {Promise<Metadata>} - A promise that resolves to the provider metadata.
 */
export const getProviderMetadata = async (): Promise<Metadata> => {
  return await DataRegistry.getProviderMetadata();
};

/**
 * Retrieves the consent status for a producer.
 *
 * @param {string} _address - The address of the producer.
 * @returns {Promise<ConsentStatus>} - A promise that resolves to the consent status.
 */
export const getProducerConsent = async (_address: string): Promise<ConsentStatus> => {
  return await DataRegistry.getProducerConsent(_address);
};

/**
 * Retrieves a specific producer's record.
 *
 * @param {string} _producer - The producer's address.
 * @param {string} _recordId - The ID of the record.
 * @returns {Promise<RegRecord>} - A promise that resolves to the producer's record.
 */
export const getProducerRecord = async (
  _producer: string,
  _recordId: string
): Promise<RegRecord> => {
  return await DataRegistry.getProducerRecord(_producer, _recordId);
};

/**
 * Retrieves all records for a specific producer.
 *
 * @param {string} _producer - The producer's address.
 * @returns {Promise<ProducerRecords[]>} - a list of records with status, consent, records and nonce
 */

export const getProducerRecords = async (_producer: string): Promise<ProducerRecords> => {
  return await DataRegistry.getProducerRecords(_producer);
};

/**
 * Retrieves the count of records for a specific producer.
 *
 * @param {string} _producer - The producer's address.
 * @returns {Promise<number>} - A promise that resolves to the count of records.
 */
export const getProducerRecordCount = async (_producer: string): Promise<number> => {
  return await DataRegistry.getProducerRecordCount(_producer);
};

/**
 * Retrieves information about a specific producer's record.
 *
 * @param {string} _address - The address of the producer.
 * @returns {Promise<RecordInfo>} - A promise that resolves to the record information.
 */
export const getProducerRecordInfo = async (_address: string): Promise<RecordInfo> => {
  return await DataRegistry.getProducerRecordInfo(_address);
};

/**
 * Retrieves the status of a producer's records.
 *
 * @param {string} _producer - The producer's address.
 * @returns {Promise<RecordStatus>} - A promise that resolves to the record status.
 */
export const getProducerRecordStatus = async (_producer: string): Promise<RecordStatus> => {
  return await DataRegistry.getProducerRecordStatus(_producer);
};

/**
 * Retrieves the record schema from the Data Registry contract.
 *
 * @returns {Promise<Metadata>} - A promise that resolves to the record schema.
 */
export const getRecordSchema = async (): Promise<Metadata> => {
  return await DataRegistry.getRecordSchema();
};

/**
 * Retrieves the total count of records in the registry.
 *
 * @returns {Promise<number>} - A promise that resolves to the total count of records.
 */
export const getTotalRecordsCount = async (): Promise<number> => {
  return await DataRegistry.getTotalRecordsCount();
};

/**
 * Retrieves the address of the provider.
 *
 * @returns {Promise<string>} - A promise that resolves to the provider's address.
 */
export const getProvider = async (): Promise<string> => {
  return await DataRegistry.owner();
};

/**
 * Checks if a producer exists in the registry.
 *
 * @param {string} _producer - The producer's address.
 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating existence.
 */
export const producerExists = async (_producer: string): Promise<boolean> => {
  return await DataRegistry.producerExists(_producer);
};

/**
 * Checks if the contract is paused.
 *
 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating if paused.
 */
export const paused = async (): Promise<boolean> => {
  return await DataRegistry.paused();
};

/**
 * Retrieves the address of the compensation contract.
 *
 * @returns {Promise<string>} - A promise that resolves to the compensation contract address.
 */
export const getCompensationContractAddress = async (): Promise<string> => {
  return await DataRegistry.getCompensationContractAddress();
};

// Compensation smart contract functions

/**
 * Verifies the payment status for a specific record.
 *
 * @param {string} recordId - The ID of the record to verify payment for.
 * @returns {Promise<{ isPayed: boolean }>} - A promise that resolves to an object indicating payment status.
 */
export const verifyPayment = async (recordId: string): Promise<{ isPayed: boolean }> => {
  const payed = await Compensation.verifyPayment(recordId);
  return { isPayed: payed };
};

/**
 * Retrieves the service fee from the compensation contract.
 *
 * @returns {Promise<{ serviceFee: number }>} - A promise that resolves to an object with the service fee.
 */
export const getServiceFee = async (): Promise<{ serviceFee: number }> => {
  const serviceFee = await Compensation.getServiceFee();
  return { serviceFee: Number(serviceFee) };
};

/**
 * Retrieves the Levea wallet address from the compensation contract.
 *
 * @returns {Promise<{ leveaWallet: string }>} - A promise that resolves to an object with the Levea wallet address.
 */
export const getLeveaWallet = async (): Promise<any> => {
  const leveaWallet = await Compensation.getLeveaWallet();
  return { leveaWallet };
};

/**
 * Retrieves the balance of the Levea wallet.
 *
 * @returns {Promise<{ balance: number }>} - A promise that resolves to an object with the wallet balance.
 */
export const getLeveaWalletBalance = async () => {
  const balance = await Compensation.getLeveaWalletBalance();
  return { balance: Number(balance) };
};

/**
 * Retrieves the balance of a producer by their owner address.
 *
 * @param {string} producerAddress - The address of the producer.
 * @returns {Promise<{ balance: number }>} - A promise that resolves to an object with the balance.
 */
export const getProducerBalanceByOwner = async (producerAddress: string) => {
  console.info('getProducerBalanceByOwner', producerAddress);
  const balance = await Compensation['getProducerBalance(address)'](producerAddress);
  return { balance: Number(balance) };
};

/**
 * Retrieves the minimum amount that can be withdrawn.
 *
 * @returns {Promise<{ minimumWithdrawAmount: number }>} - A promise that resolves to an object with the minimum withdraw amount.
 */
export const getMinimumWithdrawAmount = async () => {
  const amount = await Compensation.getMinimumWithdrawAmount();
  return { minimumWithdrawAmount: Number(amount) };
};

/**
 * Retrieves the unit price from the compensation contract.
 *
 * @returns {Promise<{ unitPrice: number }>} - A promise that resolves to an object with the unit price.
 */
export const getUnitPrice = async () => {
  const unitPrice = await Compensation.getUnitPrice();
  return { unitPrice: Number(unitPrice) };
};

/**
 * Retrieves the payment token address from the compensation contract.
 *
 * @returns {Promise<{ tokenAddress: string }>} - A promise that resolves to an object with the token address.
 */
export const getPaymentTokenAddress = async () => {
  const tokenAddress = await Compensation.getPaymentTokenAddress();
  return { tokenAddress };
};

/**
 * Checks if a producer exists in the compensation contract.
 *
 * @param {string} producerAddress - The address of the producer.
 * @returns {Promise<{ exists: boolean }>} - A promise that resolves to an object indicating existence.
 */
export const producerExist = async (producerAddress: string) => {
  const exists = await Compensation.producerExist(producerAddress);
  return { exists };
};
