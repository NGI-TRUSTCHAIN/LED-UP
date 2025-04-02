import { ContractError } from '../types/contract';

/**
 * Parses errors from Data Registry contract calls
 * @param error The error object from the contract call
 * @returns Parsed contract error or null if not a recognized error
 */
export function parseDataRegistryError(error: unknown): ContractError | null {
  if (!error || typeof error !== 'object') {
    return null;
  }

  const errorObj = error as { message?: string; data?: string };

  // Check for error data from contract revert
  if (errorObj.data) {
    // Check for RecordNotFound error (0x4282e7ae)
    if (errorObj.data.includes('0x4282e7ae')) {
      return {
        code: 'RecordNotFound',
        message: 'Record not found',
      };
    }
  }

  if (!errorObj.message) {
    return null;
  }

  // Extract error code and message from error message
  const match = errorObj.message.match(/DataRegistry__(\w+)/);
  if (!match) {
    return null;
  }

  const code = match[1];
  let message = '';

  switch (code) {
    case 'Unauthorized':
      message = 'Unauthorized access';
      break;
    case 'RecordNotFound':
      message = 'Record not found';
      break;
    case 'RecordAlreadyExists':
      message = 'Record already exists';
      break;
    case 'InvalidDID':
      message = 'Invalid DID';
      break;
    case 'AccessDenied':
      message = 'Access denied';
      break;
    case 'InvalidAccessDuration':
      message = 'Invalid access duration';
      break;
    case 'ExpiredAccess':
      message = 'Access has expired';
      break;
    case 'InvalidContentHash':
      message = 'Invalid content hash';
      break;
    case 'PaymentNotVerified':
      message = 'Payment not verified';
      break;
    case 'DidAuthNotInitialized':
      message = 'DID authentication not initialized';
      break;
    case 'InvalidDidAuthAddress':
      message = 'Invalid DID authentication address';
      break;
    case 'AlreadyRegistered':
      message = 'Producer already registered';
      break;
    case 'ConsentNotAllowed':
      message = 'Consent not allowed';
      break;
    default:
      message = 'Unknown error';
  }

  return {
    code,
    message,
  };
}
