import { clsx, type ClassValue } from 'clsx';
import { CipherKey } from 'crypto';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const toCipherKey = (key: string): CipherKey => {
  return Buffer.from(key, 'hex') as CipherKey;
};
