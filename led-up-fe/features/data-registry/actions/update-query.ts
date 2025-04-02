'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { API_ENDPOINTS } from '../config';
import {
  changePauseStateSchema,
  registerProducerContractSchema,
  registerProducerRecordSchema,
  removeProducerRecordSchema,
  renounceOwnershipSchema,
  shareDataSchema,
  transferOwnershipSchema,
  updateProducerConsentSchema,
  updateProducerRecordSchema,
  updateProducerRecordStatusSchema,
  verifyDataSchema,
} from '../schema';
import { ProducerRegistrationParam } from '../types';
import { fetchWithErrorHandling } from '../utils/api';
import { ApiError } from '../../../lib/error';
import { fromZodError } from 'zod-validation-error';

/**
 * Server action to register a producer in the DataRegistry
 * @param params Registration parameters
 * @param formData Form data containing producer registration information
 * @returns The transaction receipt
 * @throws ApiError if the request fails
 */
export async function registerProducer(params: ProducerRegistrationParam) {
  try {
    // Parse and validate form data
    const validationResult = registerProducerContractSchema.safeParse({
      status: params.status,
      consent: params.consent,
    });

    if (!validationResult.success) {
      const errorMessage = fromZodError(validationResult.error).message;
      return {
        success: false,
        data: null,
        error: errorMessage,
        message: errorMessage,
      };
    }

    const { status, consent } = validationResult.data;

    // Prepare the request body
    const requestBody = {
      status,
      consent,
    };

    const response = await fetchWithErrorHandling(API_ENDPOINTS.DATA_REGISTRY.REGISTER_PRODUCER, {
      method: 'POST',
      body: JSON.stringify(requestBody),
      cache: 'no-store',
    });

    if (!response.success || !response.data) {
      return {
        success: false,
        data: null,
        error: response.message || 'Failed to register producer',
        message: response.message || 'Failed to register producer',
      };
    }

    // Revalidate data registry cache
    revalidateTag('data-registry');
    revalidatePath('/dashboard/producer');

    return {
      success: true,
      data: response.data,
      error: null,
      message: 'Producer registered successfully!',
    };
  } catch (error) {
    console.error(`Error registering producer: ${error}`);

    const errorMessage = error instanceof Error ? error.message : 'Failed to register producer';

    return {
      success: false,
      data: null,
      error: errorMessage,
      message: errorMessage,
    };
  }
}

/**
 * Server action to register a producer record
 * @param prevState Previous state from useFormState
 * @param formData Form data containing producer registration information
 * @returns The transaction receipt and record data
 * @throws ApiError if the request fails
 */
export async function registerProducerRecord(prevState: any, formData: FormData) {
  try {
    // Parse and validate form data
    const validationResult = registerProducerRecordSchema.safeParse({
      ownerDid: formData.get('ownerDid'),
      producer: formData.get('producer'),
      consent: formData.get('consent'),
      data: formData.get('data'),
    });

    if (!validationResult.success) {
      const errorMessage = fromZodError(validationResult.error).message;
      return {
        success: false,
        data: null,
        error: errorMessage,
        message: errorMessage,
      };
    }

    const { ownerDid, producer, consent, data } = validationResult.data;

    // Prepare the request body
    const requestBody = {
      ownerDid,
      producer,
      consent,
      data,
    };

    const response = await fetchWithErrorHandling(API_ENDPOINTS.DATA_REGISTRY.REGISTER_PRODUCER_RECORD, {
      method: 'POST',
      body: JSON.stringify(requestBody),
      cache: 'no-store',
    });

    if (!response.success || !response.data) {
      return {
        success: false,
        data: null,
        error: response.message || 'Failed to register producer record',
        message: response.message || 'Failed to register producer record',
      };
    }

    // Revalidate data registry cache
    revalidateTag('data-registry');
    revalidatePath('/dashboard/producer');

    return {
      success: true,
      data: response.data,
      error: null,
      message: 'Producer record registered successfully!',
    };
  } catch (error) {
    console.error(`Error registering producer record: ${error}`);

    const errorMessage = error instanceof Error ? error.message : 'Failed to register producer record';

    return {
      success: false,
      data: null,
      error: errorMessage,
      message: errorMessage,
    };
  }
}

/**
 * Server action to update a producer record
 * @param prevState Previous state from useFormState
 * @param formData Form data containing producer record update information
 * @returns The transaction receipt and updated record data
 * @throws ApiError if the request fails
 */
export async function updateProducerRecord(prevState: any, formData: FormData) {
  try {
    // Parse and validate form data
    const validationResult = updateProducerRecordSchema.safeParse({
      recordId: formData.get('recordId'),
      producer: formData.get('producer'),
      resourceType: formData.get('resourceType'),
      status: formData.get('status'),
      consent: formData.get('consent'),
      updaterDid: formData.get('updaterDid'),
      data: formData.get('data'),
    });

    if (!validationResult.success) {
      const errorMessage = fromZodError(validationResult.error).message;
      return {
        success: false,
        data: null,
        error: errorMessage,
        message: errorMessage,
      };
    }

    const { recordId, producer, resourceType, status, consent, updaterDid, data } = validationResult.data;

    // Prepare the request body
    const requestBody = {
      recordId,
      producer,
      resourceType,
      status,
      consent,
      updaterDid,
      data,
    };

    const response = await fetchWithErrorHandling(API_ENDPOINTS.DATA_REGISTRY.UPDATE_PRODUCER_RECORD, {
      method: 'POST',
      body: JSON.stringify(requestBody),
      cache: 'no-store',
    });

    if (!response.success || !response.data) {
      return {
        success: false,
        data: null,
        error: response.message || 'Failed to update producer record',
        message: response.message || 'Failed to update producer record',
      };
    }

    // Revalidate data registry cache
    revalidateTag('data-registry');
    revalidatePath('/dashboard/producer');

    return {
      success: true,
      data: response.data,
      error: null,
      message: 'Producer record updated successfully!',
    };
  } catch (error) {
    console.error(`Error updating producer record: ${error}`);

    const errorMessage = error instanceof Error ? error.message : 'Failed to update producer record';

    return {
      success: false,
      data: null,
      error: errorMessage,
      message: errorMessage,
    };
  }
}

/**
 * Server action to update a producer record's status
 * @param formData Form data containing status update information
 * @returns The transaction receipt and updated status
 * @throws ApiError if the request fails
 */
export async function updateProducerRecordStatus(formData: FormData) {
  try {
    // Parse and validate form data
    const validationResult = updateProducerRecordStatusSchema.safeParse({
      producer: formData.get('producer'),
      status: formData.get('status'),
    });

    if (!validationResult.success) {
      const errorMessage = fromZodError(validationResult.error).message;
      throw new ApiError(errorMessage, 400);
    }

    const { producer, status } = validationResult.data;

    // Prepare the request body
    const requestBody = {
      producer,
      status,
    };

    const response = await fetchWithErrorHandling(API_ENDPOINTS.DATA_REGISTRY.UPDATE_PRODUCER_RECORD_STATUS, {
      method: 'POST',
      body: JSON.stringify(requestBody),
      cache: 'no-store',
    });

    if (!response.success || !response.data) {
      throw new ApiError(response.message || 'Failed to update producer record status', 400);
    }

    // Revalidate data registry cache
    revalidateTag('data-registry');
    revalidatePath('/dashboard/producer');

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error(`Error updating producer record status: ${error}`);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error instanceof Error ? error.message : 'Failed to update producer record status', 500);
  }
}

/**
 * Server action to update a producer's consent status
 * @param formData Form data containing consent update information
 * @returns The transaction receipt and updated consent status
 * @throws ApiError if the request fails
 */
export async function updateProducerConsent(formData: FormData) {
  try {
    // Parse and validate form data
    const validationResult = updateProducerConsentSchema.safeParse({
      producer: formData.get('producer'),
      status: formData.get('status'),
    });

    if (!validationResult.success) {
      const errorMessage = fromZodError(validationResult.error).message;
      throw new ApiError(errorMessage, 400);
    }

    const { producer, status } = validationResult.data;

    // Prepare the request body
    const requestBody = {
      producer,
      status,
    };

    const response = await fetchWithErrorHandling(API_ENDPOINTS.DATA_REGISTRY.UPDATE_PRODUCER_CONSENT, {
      method: 'POST',
      body: JSON.stringify(requestBody),
      cache: 'no-store',
    });

    if (!response.success || !response.data) {
      throw new ApiError(response.message || 'Failed to update producer consent', 400);
    }

    // Revalidate data registry cache
    revalidateTag('data-registry');
    revalidatePath('/dashboard/producer');

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error(`Error updating producer consent: ${error}`);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error instanceof Error ? error.message : 'Failed to update producer consent', 500);
  }
}

/**
 * Server action to share data with a consumer
 * @param formData Form data containing data sharing information
 * @returns The transaction receipt
 * @throws ApiError if the request fails
 */
export async function shareData(formData: FormData) {
  try {
    // Parse and validate form data
    const validationResult = shareDataSchema.safeParse({
      recordId: formData.get('recordId'),
      consumerDid: formData.get('consumerDid'),
      ownerDid: formData.get('ownerDid'),
    });

    if (!validationResult.success) {
      const errorMessage = fromZodError(validationResult.error).message;
      throw new ApiError(errorMessage, 400);
    }

    const { recordId, consumerDid, ownerDid } = validationResult.data;

    // Prepare the request body
    const requestBody = {
      recordId,
      consumerDid,
      ownerDid,
    };

    const response = await fetchWithErrorHandling(API_ENDPOINTS.DATA_REGISTRY.SHARE_DATA, {
      method: 'POST',
      body: JSON.stringify(requestBody),
      cache: 'no-store',
    });

    if (!response.success || !response.data) {
      throw new ApiError(response.message || 'Failed to share data', 400);
    }

    // Revalidate data registry cache
    revalidateTag('data-registry');
    revalidatePath('/dashboard/producer');

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error(`Error sharing data: ${error}`);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error instanceof Error ? error.message : 'Failed to share data', 500);
  }
}

/**
 * Server action to verify data
 * @param formData Form data containing data verification information
 * @returns The transaction receipt
 * @throws ApiError if the request fails
 */
export async function verifyData(formData: FormData) {
  try {
    // Parse and validate form data
    const validationResult = verifyDataSchema.safeParse({
      recordId: formData.get('recordId'),
      verifierDid: formData.get('verifierDid'),
    });

    if (!validationResult.success) {
      const errorMessage = fromZodError(validationResult.error).message;
      throw new ApiError(errorMessage, 400);
    }

    const { recordId, verifierDid } = validationResult.data;

    // Prepare the request body
    const requestBody = {
      recordId,
      verifierDid,
    };

    const response = await fetchWithErrorHandling(API_ENDPOINTS.DATA_REGISTRY.VERIFY_DATA, {
      method: 'POST',
      body: JSON.stringify(requestBody),
      cache: 'no-store',
    });

    if (!response.success || !response.data) {
      throw new ApiError(response.message || 'Failed to verify data', 400);
    }

    // Revalidate data registry cache
    revalidateTag('data-registry');
    revalidatePath('/dashboard/provider');

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error(`Error verifying data: ${error}`);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error instanceof Error ? error.message : 'Failed to verify data', 500);
  }
}

/**
 * Server action to remove a producer record
 * @param formData Form data containing producer record removal information
 * @returns The transaction receipt
 * @throws ApiError if the request fails
 */
export async function removeProducerRecord(formData: FormData) {
  try {
    // Parse and validate form data
    const validationResult = removeProducerRecordSchema.safeParse({
      producer: formData.get('producer'),
    });

    if (!validationResult.success) {
      const errorMessage = fromZodError(validationResult.error).message;
      throw new ApiError(errorMessage, 400);
    }

    const { producer } = validationResult.data;

    // Prepare the request body
    const requestBody = {
      producer,
    };

    const response = await fetchWithErrorHandling(API_ENDPOINTS.DATA_REGISTRY.REMOVE_PRODUCER_RECORD, {
      method: 'POST',
      body: JSON.stringify(requestBody),
      cache: 'no-store',
    });

    if (!response.success || !response.data) {
      throw new ApiError(response.message || 'Failed to remove producer record', 400);
    }

    // Revalidate data registry cache
    revalidateTag('data-registry');
    revalidatePath('/dashboard/provider');

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error(`Error removing producer record: ${error}`);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error instanceof Error ? error.message : 'Failed to remove producer record', 500);
  }
}

/**
 * Server action to change the pause state of the contract
 * @param formData Form data containing pause state information
 * @returns The transaction receipt and updated pause state
 * @throws ApiError if the request fails
 */
export async function changePauseState(formData: FormData) {
  try {
    // Parse and validate form data
    const validationResult = changePauseStateSchema.safeParse({
      pause: formData.get('pause'),
    });

    if (!validationResult.success) {
      const errorMessage = fromZodError(validationResult.error).message;
      throw new ApiError(errorMessage, 400);
    }

    const { pause } = validationResult.data;

    // Prepare the request body
    const requestBody = {
      pause,
    };

    const response = await fetchWithErrorHandling(API_ENDPOINTS.DATA_REGISTRY.CHANGE_PAUSE_STATE, {
      method: 'POST',
      body: JSON.stringify(requestBody),
      cache: 'no-store',
    });

    if (!response.success || !response.data) {
      throw new ApiError(response.message || 'Failed to change pause state', 400);
    }

    // Revalidate data registry cache
    revalidateTag('data-registry');
    revalidatePath('/dashboard/admin');

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error(`Error changing pause state: ${error}`);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error instanceof Error ? error.message : 'Failed to change pause state', 500);
  }
}

/**
 * Server action to transfer ownership of the contract
 * @param formData Form data containing new owner information
 * @returns The transaction receipt and new owner address
 * @throws ApiError if the request fails
 */
export async function transferOwnership(formData: FormData) {
  try {
    // Parse and validate form data
    const validationResult = transferOwnershipSchema.safeParse({
      newOwner: formData.get('newOwner'),
    });

    if (!validationResult.success) {
      const errorMessage = fromZodError(validationResult.error).message;
      throw new ApiError(errorMessage, 400);
    }

    const { newOwner } = validationResult.data;

    // Prepare the request body
    const requestBody = {
      newOwner,
    };

    const response = await fetchWithErrorHandling(API_ENDPOINTS.DATA_REGISTRY.TRANSFER_OWNERSHIP, {
      method: 'POST',
      body: JSON.stringify(requestBody),
      cache: 'no-store',
    });

    if (!response.success || !response.data) {
      throw new ApiError(response.message || 'Failed to transfer ownership', 400);
    }

    // Revalidate data registry cache
    revalidateTag('data-registry');
    revalidatePath('/dashboard/admin');

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error(`Error transferring ownership: ${error}`);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error instanceof Error ? error.message : 'Failed to transfer ownership', 500);
  }
}

/**
 * Server action to renounce ownership of the contract
 * @returns The transaction receipt
 * @throws ApiError if the request fails
 */
export async function renounceOwnership() {
  try {
    // Validate with empty schema (no parameters needed)
    const validationResult = renounceOwnershipSchema.safeParse({});

    if (!validationResult.success) {
      const errorMessage = fromZodError(validationResult.error).message;
      throw new ApiError(errorMessage, 400);
    }

    const response = await fetchWithErrorHandling(API_ENDPOINTS.DATA_REGISTRY.RENOUNCE_OWNERSHIP, {
      method: 'POST',
      body: JSON.stringify({}),
      cache: 'no-store',
    });

    if (!response.success || !response.data) {
      throw new ApiError(response.message || 'Failed to renounce ownership', 400);
    }

    // Revalidate data registry cache
    revalidateTag('data-registry');
    revalidatePath('/dashboard/admin');

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error(`Error renouncing ownership: ${error}`);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error instanceof Error ? error.message : 'Failed to renounce ownership', 500);
  }
}

// Read-only server actions
