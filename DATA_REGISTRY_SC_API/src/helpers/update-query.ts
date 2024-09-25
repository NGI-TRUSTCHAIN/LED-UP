import { Contract, parseEther, TransactionReceipt, Wallet } from 'ethers';
import DataRegistry from './data-registry';
import Compensation from './compensation';
import { Metadata, ProcessPaymentParams, ProducerRegistrationParam, RecordSchema } from '../types';
import { provider, wallet } from './provider';
import { CompensationABI } from '../utils/compensation.abi';
import { COMPENSATION_CONTRACT_ADDRESS } from '../constants';

export const changePauseState = async (_pause: boolean): Promise<TransactionReceipt> => {
  const tx = await DataRegistry.changePauseState(_pause);
  console.log(tx);
  return await tx.wait();
};

export const registerProducerRecord = async ({
  recordId,
  producer,
  signature,
  resourceType,
  consent,
  metadata,
}: ProducerRegistrationParam): Promise<TransactionReceipt> => {
  // metadata.hash = Buffer.from(metadata.hash);
  // signature = Signature.from(signature as SignatureLike);
  console.log(signature);
  const tx = await DataRegistry.registerProducerRecord(recordId, producer, signature, resourceType, consent, metadata);
  return await tx.wait();
};

export const removeProducerRecord = async (_producer: string): Promise<TransactionReceipt> => {
  const tx = await DataRegistry.removeProducerRecord(_producer);
  return await tx.wait();
};

export const renounceOwnership = async (): Promise<TransactionReceipt> => {
  const tx = await DataRegistry.renounceProvidership();
  return await tx.wait();
};

export const transferOwnership = async (newProvider: string): Promise<TransactionReceipt> => {
  const tx = await DataRegistry.transferProvidership(newProvider);
  return await tx.wait();
};

export const updateProviderMetadata = async (_metadata: Metadata): Promise<TransactionReceipt> => {
  const tx = await DataRegistry.updateProviderMetadata(_metadata);
  return await tx.wait();
};

export const updateProviderRecordSchema = async (_schemaRef: RecordSchema): Promise<TransactionReceipt> => {
  const tx = await DataRegistry.updateProviderRecordSchema(_schemaRef);
  return await tx.wait();
};

export const updateProducerConsent = async (producer: string, status: number): Promise<TransactionReceipt> => {
  const tx = await DataRegistry.updateProducerConsent(producer, status);
  return await tx.wait();
};

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

export const updateProducerRecordStatus = async (_producer: string, _status: number): Promise<TransactionReceipt> => {
  const tx = await DataRegistry.updateProducerRecordStatus(_producer, _status);
  return await tx.wait();
};

export const shareData = async (producer: string, consumer: string, recordId: string): Promise<TransactionReceipt> => {
  const tx = await DataRegistry.shareData(producer, consumer, recordId);
  return await tx.wait();
};

// Compensation - Smart Contract Functions
export const processPayment = async (params: ProcessPaymentParams): Promise<void> => {
  const tx = await Compensation.processPayment(params.producer, params.recordId, params.dataSize);
  await tx.wait();
};

export const withdrawProducerBalance = async (amount: number): Promise<TransactionReceipt> => {
  const signer = await new Wallet(process.env.PATIENT_PRIVATE_KEY, provider);
  const ProducerCompensation = new Contract(COMPENSATION_CONTRACT_ADDRESS, CompensationABI, signer);

  const tx = await ProducerCompensation.withdrawProducerBalance(parseEther(amount.toString()));
  return await tx.wait();
};

export const withdrawServiceFees = async (amount: number): Promise<TransactionReceipt> => {
  const tx = await Compensation.withdrawServiceFees(amount);
  return await tx.wait();
};

export const removeProducer = async (producer: string): Promise<TransactionReceipt> => {
  const tx = await Compensation.removeProducer(producer);
  return await tx.wait();
};

export const changeServiceFee = async (newServiceFee: number): Promise<TransactionReceipt> => {
  const tx = await Compensation.changeServiceFee(newServiceFee);
  return await tx.wait();
};

export const changeUnitPrice = async (newUnitPrice: number): Promise<TransactionReceipt> => {
  const tx = await Compensation.changeUnitPrice(newUnitPrice);
  return await tx.wait();
};

export const setMinimumWithdrawAmount = async (amount: number): Promise<TransactionReceipt> => {
  const tx = await Compensation.setMinimumWithdrawAmount(parseEther(amount.toString()));
  return await tx.wait();
};

export const changeTokenAddress = async (tokenAddress: string): Promise<TransactionReceipt> => {
  const tx = await Compensation.changeTokenAddress(tokenAddress);
  return await tx.wait();
};

export const pauseService = async (): Promise<TransactionReceipt> => {
  const tx = await Compensation.pauseService();
  return await tx.wait();
};

export const unpauseService = async (): Promise<TransactionReceipt> => {
  const tx = await Compensation.unpauseService();
  return await tx.wait();
};

export const withdrawServiceFee = async (amount: number) => {
  const tx = await Compensation.withdrawServiceFees(amount);
  return await tx.wait();
};
