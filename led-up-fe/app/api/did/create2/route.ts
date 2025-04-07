import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:7071';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Forward the request to the Azure Function
    const response = await fetch(`${API_BASE_URL}/api/did/create2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // Check if the response is ok before trying to parse JSON
    if (!response.ok) {
      // Get the response text first to check if it's valid JSON
      const responseText = await response.text();

      // Try to parse the response as JSON
      let errorData;
      try {
        errorData = responseText ? JSON.parse(responseText) : { message: 'Empty response' };
      } catch (parseError) {
        console.error('Error parsing JSON error response:', parseError);
        errorData = { message: 'Invalid JSON response from API' };
      }

      return NextResponse.json(
        {
          success: false,
          message: errorData.message || `API returned status ${response.status}: ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    // Get the response text first to check if it's valid JSON
    const responseText = await response.text();

    // Try to parse the response as JSON
    let data;
    try {
      data = responseText ? JSON.parse(responseText) : { success: false, message: 'Empty response' };
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid JSON response from API',
          rawResponse: responseText.substring(0, 500), // Limit the size of the raw response
        },
        { status: 500 }
      );
    }

    // Return the response
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error in create2 API route:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred',
      },
      { status: 500 }
    );
  }
}
