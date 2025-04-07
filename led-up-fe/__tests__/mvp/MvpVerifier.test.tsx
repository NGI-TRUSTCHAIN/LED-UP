import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MvpVerifier from '@/features/mvp/MvpVerifier';
import * as mvpHashUtils from '@/features/zkp/utils/mvpOptimizedHash';
import * as snarkjs from 'snarkjs';

// Mock the hash utilities
jest.mock('../features/circom/utils/mvpOptimizedHash', () => ({
  mvpCalculateHash: jest.fn().mockResolvedValue('mocked-hash-value'),
  generateMvpCircuitInputs: jest.fn().mockResolvedValue({ in: [1, 2, 3, 4], hash: [5, 6] }),
  formatHashForDisplay: jest.fn().mockReturnValue('formatted-hash-display'),
  initPoseidon: jest.fn().mockResolvedValue({}),
}));

// Mock snarkjs
jest.mock('snarkjs', () => ({
  groth16: {
    fullProve: jest.fn().mockResolvedValue({
      proof: { mockProof: true },
      publicSignals: ['1'], // 1 means valid
    }),
  },
}));

describe('MvpVerifier Component Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the form with default values', () => {
    render(<MvpVerifier />);

    // Check that the form title is rendered
    expect(screen.getByText('MVP Hash Verifier')).toBeInTheDocument();

    // Check that input fields exist with default values
    const input1 = screen.getByLabelText('Input 1') as HTMLInputElement;
    const input2 = screen.getByLabelText('Input 2') as HTMLInputElement;
    const input3 = screen.getByLabelText('Input 3') as HTMLInputElement;
    const input4 = screen.getByLabelText('Input 4') as HTMLInputElement;

    expect(input1.value).toBe('123');
    expect(input2.value).toBe('456');
    expect(input3.value).toBe('789');
    expect(input4.value).toBe('101112');

    // Check buttons are present
    expect(screen.getByText('Verify Hash')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });

  test('submits form and displays hash verification result', async () => {
    render(<MvpVerifier />);

    // Submit the form
    fireEvent.click(screen.getByText('Verify Hash'));

    // Check loading state
    expect(screen.getByText('Verifying...')).toBeInTheDocument();

    // Wait for verification to complete
    await waitFor(() => {
      expect(screen.getByText('Verification Successful ✅')).toBeInTheDocument();
      expect(screen.getByText('Calculated Hash:')).toBeInTheDocument();
      expect(screen.getByText('formatted-hash-display')).toBeInTheDocument();
    });

    // Verify our utility functions were called correctly
    expect(mvpHashUtils.mvpCalculateHash).toHaveBeenCalledWith([123, 456, 789, 101112]);
    expect(mvpHashUtils.generateMvpCircuitInputs).toHaveBeenCalledWith([123, 456, 789, 101112], undefined);
    expect(mvpHashUtils.formatHashForDisplay).toHaveBeenCalledWith('mocked-hash-value');

    // Verify snarkjs was called correctly
    expect(snarkjs.groth16.fullProve).toHaveBeenCalledWith(
      { in: [1, 2, 3, 4], hash: [5, 6] },
      '/circuits/mvp/MinimalHashVerifier_js/MinimalHashVerifier.wasm',
      '/circuits/mvp/circuit.zkey'
    );
  });

  test('handles custom hash input correctly', async () => {
    render(<MvpVerifier />);

    // Check the custom hash checkbox
    const customHashCheckbox = screen.getByLabelText('Use custom hash');
    fireEvent.click(customHashCheckbox);

    // Enter a custom hash
    const customHashInput = screen.getByPlaceholderText('Enter hash value') as HTMLInputElement;
    fireEvent.change(customHashInput, { target: { value: 'custom-hash-value' } });

    // Submit the form
    fireEvent.click(screen.getByText('Verify Hash'));

    // Wait for verification to complete
    await waitFor(() => {
      expect(screen.getByText('Verification Successful ✅')).toBeInTheDocument();
    });

    // Verify we used the custom hash instead of calculating one
    expect(mvpHashUtils.mvpCalculateHash).not.toHaveBeenCalled();
    expect(mvpHashUtils.generateMvpCircuitInputs).toHaveBeenCalledWith([123, 456, 789, 101112], 'custom-hash-value');
  });

  test('handles reset button correctly', async () => {
    render(<MvpVerifier />);

    // Submit the form first to get results
    fireEvent.click(screen.getByText('Verify Hash'));

    // Wait for verification to complete
    await waitFor(() => {
      expect(screen.getByText('Verification Successful ✅')).toBeInTheDocument();
    });

    // Now click reset
    fireEvent.click(screen.getByText('Reset'));

    // Verify results are cleared
    expect(screen.queryByText('Verification Successful ✅')).not.toBeInTheDocument();
    expect(screen.queryByText('Calculated Hash:')).not.toBeInTheDocument();
  });

  test('handles error state correctly', async () => {
    // Mock the snarkjs function to throw an error
    (snarkjs.groth16.fullProve as jest.Mock).mockRejectedValueOnce(new Error('Test error'));

    render(<MvpVerifier />);

    // Submit the form
    fireEvent.click(screen.getByText('Verify Hash'));

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText('Error:')).toBeInTheDocument();
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });
  });

  test('handles invalid verification result', async () => {
    // Mock snarkjs to return an invalid result (0)
    (snarkjs.groth16.fullProve as jest.Mock).mockResolvedValueOnce({
      proof: { mockProof: true },
      publicSignals: ['0'], // 0 means invalid
    });

    render(<MvpVerifier />);

    // Submit the form
    fireEvent.click(screen.getByText('Verify Hash'));

    // Wait for verification to complete
    await waitFor(() => {
      expect(screen.getByText('Verification Failed ❌')).toBeInTheDocument();
      expect(screen.getByText('The provided inputs do not match the expected hash.')).toBeInTheDocument();
    });
  });
});
