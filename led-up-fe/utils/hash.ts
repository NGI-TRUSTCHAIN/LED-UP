import { createHash } from 'crypto';

type Field4 = [string, string, string, string];

function computeHash(data: string | object): string {
  let jsonObj;
  if (typeof data === 'string') {
    jsonObj = JSON.parse(data);
  }
  let jsonStr = JSON.stringify(jsonObj, null, 2);

  const hash = createHash('sha256');
  hash.update(jsonStr);
  return hash.digest('hex'); // Return hash as a hex string
}

export const prepareField = async (data: object | string): Promise<Field4> => {
  const hash = computeHash(data);
  const firstSegment = hash.substring(0, 32); // First 128 bits
  const secondSegment = hash.substring(32, 64); // Second 128 bits
  return [
    `0x${firstSegment}`,
    `0x${secondSegment}`,
    '0x00000000000000000000000000000000',
    '0x00000000000000000000000000000000',
  ]; // Return as [firstSegment, secondSegment, '00000000000000000000000000000000', '00000000000000000000000000000000'];
};
