import { ApiResponse } from '@/types/api';
import { ApiError } from '@/lib/error';

/**
 * Fetch wrapper with error handling
 */
export async function fetchWithErrorHandling<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    // Ensure headers are properly formatted
    const headers = {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    };

    const response = await fetch(url, {
      ...options,
      headers,
      next: { tags: ['auth'] },
    });

    // Handle empty responses
    const text = await response.text();

    let data: ApiResponse<T>;

    try {
      data = text ? JSON.parse(text) : { success: false, message: 'Empty response' };
    } catch (parseError) {
      throw new ApiError(`Failed to parse response: ${text.substring(0, 100)}`, response.status);
    }

    if (!response.ok) {
      throw new ApiError(data.message || 'An error occurred', response.status);
    }

    // If the response doesn't have the expected format, wrap it in our standard format
    if (data.success === undefined) {
      return {
        success: true,
        data: data as unknown as T,
        message: 'Success',
      };
    }

    return data as ApiResponse<T>;
  } catch (error) {
    console.error('Fetch error:', error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error instanceof Error ? error.message : 'An unknown error occurred');
  }
}
