import { Contract, ethers, parseEther, TransactionReceipt, Wallet } from 'ethers';
import DataRegistry from './data-registry';
import Compensation from './compensation';
import { Metadata, ProcessPaymentParams, ProducerRegistrationParam, RecordSchema } from '../types';
import { provider, wallet } from './provider';
import { CompensationABI } from '../utils/compensation.abi';
import { COMPENSATION_CONTRACT_ADDRESS } from '../constants';
import { DataRegistryABI } from '../utils/dataRegistry.abi';

/**
 * Change the pause state of the DataRegistry contract.
 *
 * This asynchronous function allows you to toggle the pause state of the contract.
 * If `_pause` is true, the contract will be paused; if false, it will be unpaused.
 *
 * @param {boolean} _pause - The desired pause state. Pass `true` to pause and `false` to unpause.
 * @returns {Promise<TransactionReceipt>} - A promise that resolves to the transaction receipt after the state change.
 * @throws {Error} - Throws an error if the transaction fails.
 */
export const changePauseState = async (_pause: boolean): Promise<TransactionReceipt> => {
  const tx = await DataRegistry.changePauseState(_pause);
  console.log(tx);
  return await tx.wait();
};

/**
 * Register a producer record in the DataRegistry contract.
 *
 * This asynchronous function allows you to register a new producer record with the specified details.
 *
 * @param {ProducerRegistrationParam} params - The parameters for registering the producer record.
 * @param {string} params.recordId - The unique identifier for the producer record.
 * @param {string} params.producer - The address of the producer registering the record.
 * @param {string} params.signature - The signature validating the registration.
 * @param {string} params.resourceType - The type of resource being registered.
 * @param {boolean} params.consent - The consent status associated with the producer record.
 * @param {Object} params.metadata - Additional metadata related to the registration.
 * @returns {Promise<TransactionReceipt>} - A promise that resolves to the transaction receipt after the registration.
 * @throws {Error} - Throws an error if the transaction fails.
 */
export const registerProducerRecord = async ({
  recordId,
  producer,
  signature,
  resourceType,
  consent,
  metadata,
}: ProducerRegistrationParam): Promise<TransactionReceipt> => {
  console.log({ recordId, producer, signature, resourceType, consent, metadata });
  const iface = new ethers.Interface(DataRegistryABI);
  const decodedError = iface.parseError('0xd93c0665');
  console.log({ decodedError });
  const tx = await DataRegistry.registerProducerRecord(recordId, producer, signature, resourceType, consent, metadata);
  return await tx.wait();
};

/**
 * Remove a producer record from the DataRegistry contract.
 *
 * This asynchronous function allows you to remove a producer record associated with the specified producer address.
 *
 * @param {string} _producer - The address of the producer whose record is to be removed.
 * @returns {Promise<TransactionReceipt>} - A promise that resolves to the transaction receipt after the record is removed.
 * @throws {Error} - Throws an error if the transaction fails.
 */
export const removeProducerRecord = async (_producer: string): Promise<TransactionReceipt> => {
  const tx = await DataRegistry.removeProducerRecord(_producer);
  return await tx.wait();
};

/**
 * Renounce the ownership of the DataRegistry contract.
 *
 * This asynchronous function allows the current owner to renounce their ownership rights.
 *
 * @returns {Promise<TransactionReceipt>} - A promise that resolves to the transaction receipt once ownership has been renounced.
 *
 * This function does not take any parameters.
 *
 * @throws {Error} - Throws an error if the transaction fails.
 *
 * An error will be thrown if the transaction does not complete successfully.
 */
export const renounceOwnership = async (): Promise<TransactionReceipt> => {
  const tx = await DataRegistry.renounceProvidership();
  return await tx.wait();
};

/**
 * Transfer ownership of the DataRegistry contract to a new provider.
 *
 * This asynchronous function allows the current owner to transfer ownership rights to a specified new provider address.
 *
 * @param {string} newProvider - The address of the new provider to whom ownership will be transferred.
 *
 * @returns {Promise<TransactionReceipt>} - A promise that resolves to the transaction receipt once the ownership transfer has been confirmed.
 *
 * @throws {Error} - Throws an error if the transaction fails.
 *
 * An error will be thrown if the transaction does not complete successfully.
 */
export const transferOwnership = async (newProvider: string): Promise<TransactionReceipt> => {
  const tx = await DataRegistry.transferProvidership(newProvider);
  return await tx.wait();
};

/**
 * Update the metadata for the current provider in the DataRegistry contract.
 *
 * This asynchronous function allows updating the metadata associated with the current provider.
 *
 * @param {Metadata} _metadata - An object containing the new metadata for the provider.
 *
 * @returns {Promise<TransactionReceipt>} - A promise that resolves to the transaction receipt once the metadata update has been confirmed.
 *
 * @throws {Error} - Throws an error if the transaction fails.
 *
 * An error will be thrown if the transaction does not complete successfully.
 */
export const updateProviderMetadata = async (_metadata: Metadata): Promise<TransactionReceipt> => {
  const tx = await DataRegistry.updateProviderMetadata(_metadata);
  return await tx.wait();
};

/**
 * Update the schema reference for provider records in the DataRegistry contract.
 *
 * @param {RecordSchema} _schemaRef - The new schema reference for the provider record.
 *
 * @returns {Promise<TransactionReceipt>} - A promise that resolves to the transaction receipt once the update has been confirmed.
 *
 * @throws {Error} - Throws an error if the transaction fails.
 */
export const updateProviderRecordSchema = async (_schemaRef: RecordSchema): Promise<TransactionReceipt> => {
  const tx = await DataRegistry.updateProviderRecordSchema(_schemaRef);
  return await tx.wait();
};

/**
 * Update the consent status of a producer.
 *
 * @param {string} producer - The address of the producer.
 * @param {number} status - The new consent status (e.g., 1 for consented, 0 for not consented).
 *
 * @returns {Promise<TransactionReceipt>} - A promise that resolves to the transaction receipt once the status update has been confirmed.
 *
 * @throws {Error} - Throws an error if the transaction fails.
 */
export const updateProducerConsent = async (producer: string, status: number): Promise<TransactionReceipt> => {
  const tx = await DataRegistry.updateProducerConsent(producer, status);
  return await tx.wait();
};

/**
 * Update an existing producer record in the DataRegistry contract.
 *
 * @param {ProducerRegistrationParam} params - The parameters for the producer record update, including:
 *   - recordId: The ID of the record to update.
 *   - producer: The address of the producer.
 *   - signature: The signature of the producer.
 *   - resourceType: The type of resource being updated.
 *   - status: The new status of the record.
 *   - consent: The new consent status.
 *   - metadata: Additional metadata for the record.
 *
 * @returns {Promise<TransactionReceipt>} - A promise that resolves to the transaction receipt once the record update has been confirmed.
 *
 * @throws {Error} - Throws an error if the transaction fails.
 */
export const updateProducerRecord = async ({
  recordId,
  producer,
  signature,
  resourceType,
  status,
  consent,
  metadata,
}: ProducerRegistrationParam): Promise<TransactionReceipt> => {
  const tx = await DataRegistry.updateProducerRecord(
    recordId,
    producer,
    signature,
    resourceType,
    status,
    consent,
    metadata
  );
  return await tx.wait();
};

/**
 * Update the metadata of a producer record.
 *
 * @param {string} producer - The address of the producer.
 * @param {string} recordId - The ID of the record to update.
 * @param {Object} metadata - The new metadata for the record, containing:
 *   - cid: The CID for the new metadata.
 *   - url: The URL for accessing the metadata.
 *   - hash: The hash of the new metadata.
 *
 * @returns {Promise<TransactionReceipt>} - A promise that resolves to the transaction receipt once the metadata update has been confirmed.
 *
 * @throws {Error} - Throws an error if the transaction fails.
 */
export const updateProducerRecordMetadata = async (
  producer: string,
  recordId: string,
  metadata: {
    cid: string;
    url: string;
    hash: string;
  }
): Promise<TransactionReceipt> => {
  const tx = await DataRegistry.updateProducerRecordMetadata(producer, recordId, metadata);
  return await tx.wait();
};

/**
 * Update the status of a producer record.
 *
 * @param {string} _producer - The address of the producer.
 * @param {number} _status - The new status for the producer record.
 *
 * @returns {Promise<TransactionReceipt>} - A promise that resolves to the transaction receipt once the status update has been confirmed.
 *
 * @throws {Error} - Throws an error if the transaction fails.
 */
export const updateProducerRecordStatus = async (_producer: string, _status: number): Promise<TransactionReceipt> => {
  const tx = await DataRegistry.updateProducerRecordStatus(_producer, _status);
  return await tx.wait();
};

/**
 * Share data from a producer to a consumer.
 *
 * @param {string} producer - The address of the producer sharing the data.
 * @param {string} consumer - The address of the consumer receiving the data.
 * @param {string} recordId - The ID of the record being shared.
 *
 * @returns {Promise<TransactionReceipt>} - A promise that resolves to the transaction receipt once the data sharing has been confirmed.
 *
 * @throws {Error} - Throws an error if the transaction fails.
 */
export const shareData = async (producer: string, consumer: string, recordId: string): Promise<TransactionReceipt> => {
  const tx = await DataRegistry.shareData(producer, consumer, recordId);
  return await tx.wait();
};

// Compensation - Smart Contract Functions

/**
 * Process a payment for a producer.
 *
 * @param {ProcessPaymentParams} params - The parameters for processing the payment, including:
 *   - producer: The address of the producer.
 *   - recordId: The ID of the record associated with the payment.
 *   - dataSize: The size of the data being compensated for.
 *
 * @returns {Promise<void>} - A promise that resolves when the payment has been processed.
 *
 * @throws {Error} - Throws an error if the payment processing fails.
 */
export const processPayment = async (params: ProcessPaymentParams): Promise<void> => {
  const tx = await Compensation.processPayment(params.producer, params.recordId, params.dataSize);
  await tx.wait();
};

/**
 * Withdraw the producer's balance from the compensation contract.
 *
 * @param {number} amount - The amount to withdraw.
 *
 * @returns {Promise<TransactionReceipt>} - A promise that resolves to the transaction receipt once the withdrawal has been confirmed.
 *
 * @throws {Error} - Throws an error if the withdrawal fails.
 */
export const withdrawProducerBalance = async (amount: number): Promise<TransactionReceipt> => {
  const signer = await new Wallet(process.env.PATIENT_PRIVATE_KEY, provider);
  const ProducerCompensation = new Contract(COMPENSATION_CONTRACT_ADDRESS, CompensationABI, signer);

  const tx = await ProducerCompensation.withdrawProducerBalance(parseEther(amount.toString()));
  return await tx.wait();
};

/**
 * Withdraw the service fees from the compensation contract.
 *
 * @param {number} amount - The amount to withdraw as service fees.
 *
 * @returns {Promise<TransactionReceipt>} - A promise that resolves to the transaction receipt once the withdrawal has been confirmed.
 *
 * @throws {Error} - Throws an error if the withdrawal fails.
 */
export const withdrawServiceFees = async (amount: number): Promise<TransactionReceipt> => {
  const tx = await Compensation.withdrawServiceFees(amount);
  return await tx.wait();
};

/**
 * Remove a producer from the compensation contract.
 *
 * @param {string} producer - The address of the producer to be removed.
 *
 * @returns {Promise<TransactionReceipt>} - A promise that resolves to the transaction receipt once the producer has been removed.
 *
 * @throws {Error} - Throws an error if the removal fails.
 */
export const removeProducer = async (producer: string): Promise<TransactionReceipt> => {
  const tx = await Compensation.removeProducer(producer);
  return await tx.wait();
};

/**
 * Change the service fee in the compensation contract.
 *
 * @param {number} newServiceFee - The new service fee to be set.
 *
 * @returns {Promise<TransactionReceipt>} - A promise that resolves to the transaction receipt once the service fee has been changed.
 *
 * @throws {Error} - Throws an error if the update fails.
 */
export const changeServiceFee = async (newServiceFee: number): Promise<TransactionReceipt> => {
  const tx = await Compensation.changeServiceFee(newServiceFee);
  return await tx.wait();
};

/**
 * Change the unit price in the compensation contract.
 *
 * @param {number} newUnitPrice - The new unit price to be set.
 *
 * @returns {Promise<TransactionReceipt>} - A promise that resolves to the transaction receipt once the unit price has been changed.
 *
 * @throws {Error} - Throws an error if the update fails.
 */
export const changeUnitPrice = async (newUnitPrice: number): Promise<TransactionReceipt> => {
  const tx = await Compensation.changeUnitPrice(newUnitPrice);
  return await tx.wait();
};

/**
 * Set the minimum withdraw amount for the compensation contract.
 *
 * @param {number} amount - The new minimum withdraw amount to be set.
 *
 * @returns {Promise<TransactionReceipt>} - A promise that resolves to the transaction receipt once the minimum withdraw amount has been set.
 *
 * @throws {Error} - Throws an error if the update fails.
 */
export const setMinimumWithdrawAmount = async (amount: number): Promise<TransactionReceipt> => {
  const tx = await Compensation.setMinimumWithdrawAmount(parseEther(amount.toString()));
  return await tx.wait();
};

/**
 * Change the token address used in the compensation contract.
 *
 * @param {string} tokenAddress - The new token address to be set.
 *
 * @returns {Promise<TransactionReceipt>} - A promise that resolves to the transaction receipt once the token address has been changed.
 *
 * @throws {Error} - Throws an error if the update fails.
 */
export const changeTokenAddress = async (tokenAddress: string): Promise<TransactionReceipt> => {
  const tx = await Compensation.changeTokenAddress(tokenAddress);
  return await tx.wait();
};

/**
 * Pause the service in the compensation contract.
 *
 * @returns {Promise<TransactionReceipt>} - A promise that resolves to the transaction receipt once the service has been paused.
 *
 * @throws {Error} - Throws an error if the pause fails.
 */
export const pauseService = async (): Promise<TransactionReceipt> => {
  const tx = await Compensation.pauseService();
  return await tx.wait();
};

/**
 * Unpause the service in the compensation contract.
 *
 * @returns {Promise<TransactionReceipt>} - A promise that resolves to the transaction receipt once the service has been unpaused.
 *
 * @throws {Error} - Throws an error if the unpause fails.
 */
export const unpauseService = async (): Promise<TransactionReceipt> => {
  const tx = await Compensation.unpauseService();
  return await tx.wait();
};

/**
 * Withdraw service fees from the compensation contract.
 *
 * @param {number} amount - The amount to withdraw as service fees.
 *
 * @returns {Promise<TransactionReceipt>} - A promise that resolves to the transaction receipt once the withdrawal has been confirmed.
 *
 * @throws {Error} - Throws an error if the withdrawal fails.
 */
export const withdrawServiceFee = async (amount: number) => {
  const tx = await Compensation.withdrawServiceFees(amount);
  return await tx.wait();
};
