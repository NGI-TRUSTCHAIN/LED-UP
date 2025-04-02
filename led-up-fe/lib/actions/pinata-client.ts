// @ts-nocheck
/**
 * This file provides a safer way to work with Pinata by
 * ensuring it's only imported and initialized at runtime
 */

let PinataSDK: any = null;
let pinataInstance: any = null;

// Only load the Pinata SDK when this function is called at runtime
// This prevents build-time errors when Pinata config isn't available
async function getPinataSDK() {
  if (!PinataSDK) {
    try {
      // Dynamic import to prevent build-time loading
      const { PinataSDK: SDK } = await import('pinata');
      PinataSDK = SDK;
    } catch (err) {
      console.error('Failed to load Pinata SDK:', err);
      throw new Error('Failed to load Pinata SDK');
    }
  }
  return PinataSDK;
}

// Get (or create) a Pinata instance
export async function getPinata() {
  if (!pinataInstance) {
    try {
      const SDK = await getPinataSDK();

      // Only create the instance if we have the necessary credentials
      const jwt = process.env.NEXT_PUBLIC_PINATA_JWT || process.env.PINATA_JWT;
      const gateway = process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://gateway.pinata.cloud';

      if (!jwt) {
        throw new Error('Pinata JWT not found in environment variables');
      }

      pinataInstance = new SDK({
        pinataJwt: jwt,
        pinataGateway: gateway,
      });
    } catch (err) {
      console.error('Failed to initialize Pinata:', err);
      throw new Error('Failed to initialize Pinata');
    }
  }
  return pinataInstance;
}

// Client-side mock functions that don't rely on Pinata
export function mockListFiles() {
  return {
    items: [
      { cid: 'Qm123456789', name: 'Sample File 1' },
      { cid: 'Qm987654321', name: 'Sample File 2' },
    ],
    count: 2,
  };
}

export function mockRetrieveFile(cid: string) {
  return {
    data: `This is mocked file content for ${cid}`,
    contentType: 'text/plain',
  };
}

// Safe wrappers around Pinata functions
export async function safeListFiles() {
  try {
    const pinata = await getPinata();
    return await pinata.listFiles();
  } catch (err) {
    console.warn('Using mock data because Pinata is not available:', err);
    return mockListFiles();
  }
}

export async function safeRetrieveFile(cid: string) {
  try {
    const pinata = await getPinata();
    return await pinata.gateways.get(cid);
  } catch (err) {
    console.warn(`Using mock data for CID ${cid} because Pinata is not available:`, err);
    return mockRetrieveFile(cid);
  }
}
