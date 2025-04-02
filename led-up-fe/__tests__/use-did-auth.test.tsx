// @ts-nocheck
/**
 * Tests for the useDidAuth hook
 */

import { renderHook, act } from '@testing-library/react';
import { useDidAuth } from '@/hooks/use-did-auth';
import { useAccount, useSignMessage } from 'wagmi';
import * as didAuthApi from '@/utils/api/did-auth';

// Mock dependencies
jest.mock('wagmi', () => ({
  useAccount: jest.fn(),
  useSignMessage: jest.fn(),
}));

jest.mock('@/utils/api/did-auth', () => ({
  requestChallenge: jest.fn(),
  authenticate: jest.fn(),
  checkAuth: jest.fn(),
  refreshToken: jest.fn(),
  getOrCreateDid: jest.fn().mockResolvedValue('did:ala:mainnet:0x1234567890123456789012345678901234567890'),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

// Apply the localStorage mock
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('useDidAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();

    // Mock useAccount hook
    (useAccount as jest.Mock).mockReturnValue({
      address: '0x1234567890123456789012345678901234567890',
      isConnected: true,
    });

    // Mock useSignMessage hook
    (useSignMessage as jest.Mock).mockReturnValue({
      signMessageAsync: jest.fn().mockResolvedValue('0xmocksignature'),
    });
  });

  // Basic test to verify test environment
  it('should setup correctly', () => {
    expect(useAccount).toBeDefined();
    expect(useSignMessage).toBeDefined();
    expect(localStorageMock.setItem).toBeDefined();
  });

  it('should initialize as not authenticated', () => {
    const { result } = renderHook(() => useDidAuth());

    // Verify initial state
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.did).toBe('');
    expect(result.current.address).toBe('');
  });

  it('should call API during login flow', async () => {
    // Mock API responses
    (didAuthApi.getOrCreateDid as jest.Mock).mockResolvedValue(
      'did:ala:mainnet:0x1234567890123456789012345678901234567890'
    );

    (didAuthApi.requestChallenge as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        did: 'did:ala:mainnet:0x1234567890123456789012345678901234567890',
        challenge: 'randomchallenge',
        message: 'Sign this message',
        expires: Date.now() + 3600000,
      },
    });

    (didAuthApi.authenticate as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        did: 'did:ala:mainnet:0x1234567890123456789012345678901234567890',
        authenticated: true,
        controller: '0x1234567890123456789012345678901234567890',
        token: 'new-token',
      },
    });

    const { result } = renderHook(() => useDidAuth());

    // Perform login
    await act(async () => {
      await result.current.login();
    });

    // Verify API calls
    expect(didAuthApi.getOrCreateDid).toHaveBeenCalled();
    expect(didAuthApi.requestChallenge).toHaveBeenCalled();
    expect(didAuthApi.authenticate).toHaveBeenCalled();
  });

  it('should update localStorage on login and logout', async () => {
    // Mock successful login flow
    (didAuthApi.getOrCreateDid as jest.Mock).mockResolvedValue(
      'did:ala:mainnet:0x1234567890123456789012345678901234567890'
    );

    (didAuthApi.requestChallenge as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        did: 'did:ala:mainnet:0x1234567890123456789012345678901234567890',
        challenge: 'randomchallenge',
        message: 'Sign this message',
        expires: Date.now() + 3600000,
      },
    });

    (didAuthApi.authenticate as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        did: 'did:ala:mainnet:0x1234567890123456789012345678901234567890',
        authenticated: true,
        controller: '0x1234567890123456789012345678901234567890',
        token: 'new-token',
      },
    });

    const { result } = renderHook(() => useDidAuth());

    // Log in
    await act(async () => {
      await result.current.login();
    });

    // Check token is stored
    expect(localStorageMock.setItem).toHaveBeenCalledWith('led_up_auth_token', 'new-token');

    // Log out
    act(() => {
      result.current.logout();
    });

    // Check token is removed
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('led_up_auth_token');
  });

  it('should provide auth header when authenticated', async () => {
    // Mock successful login
    (didAuthApi.getOrCreateDid as jest.Mock).mockResolvedValue('did:ala:test:0x1234');
    (didAuthApi.requestChallenge as jest.Mock).mockResolvedValue({
      success: true,
      data: { did: 'did:ala:test:0x1234', message: 'test', challenge: 'test', expires: 0 },
    });
    (didAuthApi.authenticate as jest.Mock).mockResolvedValue({
      success: true,
      data: { did: 'did:ala:test:0x1234', authenticated: true, controller: '0x1234', token: 'test-token' },
    });

    const { result } = renderHook(() => useDidAuth());

    // Login
    await act(async () => {
      await result.current.login();
    });

    // Test auth header function
    const headers = result.current.getAuthHeader();
    expect(headers).toEqual({ Authorization: 'Bearer test-token' });
  });
});
