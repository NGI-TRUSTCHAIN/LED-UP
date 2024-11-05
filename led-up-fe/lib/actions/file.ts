'use server';
import { revalidatePath } from 'next/cache';
import { PinataSDK } from 'pinata';

const producer = '0x7bE129dc9F7715f51D459c36bB127Cc2FaE98B32'; //hardcoded to single address
const recordId = 'd0658788-9eeb-4b40-9053-09e1adacdf6a'; //hardcoded to single record id

const base_url = process.env.BASE_URL || 'http://localhost:7071/api';

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: process.env.NEXT_PUBLIC_GATEWAY_URL!,
});

export const retrieveFile = async (cid: string) => {
  console.log('cid', cid);
  const response = await pinata.gateways.get(cid);

  return response;
};

export const listFiles = async () => {
  const files = await pinata.listFiles();

  return files;
};

enum ConsentStatus {
  Allowed = 0, // Consent is granted
  Denied = 1, // Consent is denied
  Pending = 2, // Consent is pending
}

type RegisterDataParam = {
  consent: ConsentStatus;
  data: any;
  // producer: Address;
};

export const upload = async ({ consent, data }: RegisterDataParam) => {
  try {
    const response = await fetch(`${base_url}/registerProducer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ consent, data, producer }),
    });
    await fetch(`${base_url}/refreshEvents`);

    const resData = await response.json();

    revalidatePath('/files');

    return resData;
  } catch (e) {
    console.log(e);
    return { error: 'Internal Server Error' };
  }
};

export const getRecord = async () => {
  const response = await fetch(`${base_url}/getProducerRecord?producer=${producer}&recordId=${recordId}`);

  const data = await response.json();

  return data;
};

export const readLatestCompletedRecord = async () => {
  const response = await fetch(`${base_url}/getCompletedBlocks`, { next: { revalidate: 60 } });
  const data = await response.json();

  return data;
};

export const getRecordCount = async () => {
  const response = await fetch(`${base_url}/getTotalRecordsCount`);
  const data = await response.json();

  return data;
};

export const getProducerRecordCount = async () => {
  const response = await fetch(`${base_url}/getProducerRecordCount?producer=${producer}`);
  const data = await response.json();
  return data;
};

export const getProducerRecords = async () => {
  const response = await fetch(`${base_url}/getProducerRecords?producer=${producer}`, { cache: 'no-store' });
  const data = await response.json();
  return data;
};
