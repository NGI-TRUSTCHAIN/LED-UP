import { renderHook, act } from '@testing-library/react';
import { useCircuitVerification } from '../../../features/circom/hooks/useCircuitVerification';
import { CircuitType } from '../../../features/circom/types';
import * as proofUtils from '../../../features/circom/utils/proof';
import '@testing-library/jest-dom';

// Mock the proof utilities
jest.mock('../../../features/circom/utils/proof', () => ({
  generateProof: jest.fn(),
  verifyProof: jest.fn(),
  processResultCode: jest.fn(),
}));

describe('useCircuitVerification Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock fetch to simulate circuit file availability
    global.fetch = jest.fn();
  });

  it('should initialize with the correct default values', () => {
    const { result } = renderHook(() => useCircuitVerification({ circuitType: CircuitType.AGE_VERIFIER }));

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.circuitReady).toBe(false);
    expect(result.current.proof).toBe(null);
  });

  it('should check for circuit availability on initialization', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

    const { result } = renderHook(() => useCircuitVerification({ circuitType: CircuitType.AGE_VERIFIER }));

    // Wait for the effect to run
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.circuitReady).toBe(true);
    expect(result.current.error).toBe(null);
  });

  it('should handle circuit file availability', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

    const { result } = renderHook(() => useCircuitVerification({ circuitType: CircuitType.AGE_VERIFIER }));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.circuitReady).toBe(true);
    expect(result.current.error).toBe(null);
  });

  it('should handle missing circuit files', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 404 });

    const { result } = renderHook(() => useCircuitVerification({ circuitType: CircuitType.AGE_VERIFIER }));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.circuitReady).toBe(false);
    expect(result.current.error).toContain('Circuit files not available');
  });

  it('should generate and verify a proof successfully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
    (proofUtils.generateProof as jest.Mock).mockResolvedValueOnce({ proof: 'test-proof' });
    (proofUtils.verifyProof as jest.Mock).mockResolvedValueOnce(true);
    (proofUtils.processResultCode as jest.Mock).mockReturnValueOnce('Verification successful');

    const { result } = renderHook(() => useCircuitVerification({ circuitType: CircuitType.AGE_VERIFIER }));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.generateAndVerifyProof({
        age: 25,
        threshold: 18,
        hashData: 'test-hash',
      });
    });

    expect(result.current.proof).toBe('test-proof');
    expect(result.current.error).toBe(null);
  });

  it('should handle proof generation errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
    (proofUtils.generateProof as jest.Mock).mockRejectedValueOnce(new Error('Proof generation failed'));

    const { result } = renderHook(() => useCircuitVerification({ circuitType: CircuitType.AGE_VERIFIER }));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.generateAndVerifyProof({
        age: 25,
        threshold: 18,
        hashData: 'test-hash',
      });
    });

    expect(result.current.proof).toBe(null);
    expect(result.current.error).toBe('Error: Proof generation failed');
  });

  it('should reset state correctly', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
    (proofUtils.generateProof as jest.Mock).mockResolvedValueOnce({ proof: 'test-proof' });
    (proofUtils.verifyProof as jest.Mock).mockResolvedValueOnce(true);
    (proofUtils.processResultCode as jest.Mock).mockReturnValueOnce('Verification successful');

    const { result } = renderHook(() => useCircuitVerification({ circuitType: CircuitType.AGE_VERIFIER }));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.generateAndVerifyProof({
        age: 25,
        threshold: 18,
        hashData: 'test-hash',
      });
    });

    await act(async () => {
      result.current.reset();
    });

    expect(result.current.proof).toBe(null);
    expect(result.current.error).toBe(null);
    expect(result.current.loading).toBe(false);
  });
});
