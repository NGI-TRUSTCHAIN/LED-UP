'use server';
import { HashingService } from '@/services/HashingService';

export async function hashData(data: any) {
  const hashingService = new HashingService();

  const hash = await hashingService.hashData(data);
  return hash;
}
