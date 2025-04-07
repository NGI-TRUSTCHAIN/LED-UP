// 'use server';

// import { createDecipheriv } from 'crypto';
// import { toCipherKey } from './utils';

// export type EncryptOutput = {
//   iv: string;
//   encrypted: string;
//   tag: string;
// };

// export const decrypt = async (data: EncryptOutput): Promise<any> => {
//   const key = await toCipherKey(process.env.ENCRYPTION_KEY as string);

//   if (!key) throw new Error('Encryption key not found');
//   try {
//     // const key = toCipherKey(keyString);

//     const { iv, tag, encrypted } = data;

//     // Create a decipher object
//     const decipher = createDecipheriv('aes-256-ccm', key, Buffer.from(iv, 'hex') as Buffer, {
//       authTagLength: 16,
//     });

//     decipher.setAuthTag(Buffer.from(tag, 'hex'));

//     // Update the decipher with the data to be decrypted
//     let decrypted = decipher.update(encrypted, 'hex', 'utf8');

//     // Finalize the decryption
//     decrypted += decipher.final('utf8');

//     return JSON.parse(decrypted);
//   } catch (error) {
//     console.error(error);
//     // throw error;
//   }
// };
