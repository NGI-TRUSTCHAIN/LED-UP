import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HashVerifier } from '@/features/circom/components';
import * as useCircuitVerificationModule from '@/features/circom/hooks/useCircuitVerification';
import * as poseidonModule from '@/features/circom/utils/poseidon';

// Mock the hook
jest.mock('@/features/circom/hooks/useCircuitVerification', () => ({
  useCircuitVerification: jest.fn(),
}));

// Mock the poseidon utils
jest.mock('@/features/circom/utils/poseidon', () => ({
  calculatePoseidonHash: jest.fn(),
  poseidonHashToHex: jest.fn(),
  splitHashForCircuit: jest.fn(),
  initializePoseidon: jest.fn(),
}));

describe('HashVerifier Component', () => {
  // Mock implementation for useCircuitVerification
  const mockGenerateAndVerifyProof = jest.fn();
  const mockReset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementation
    (useCircuitVerificationModule.useCircuitVerification as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      result: null,
      resultCode: null,
      resultMessage: null,
      generateAndVerifyProof: mockGenerateAndVerifyProof,
      reset: mockReset,
      circuitReady: true,
      proof: null,
      publicSignals: null,
    });

    // Mock Poseidon hash functions
    (poseidonModule.calculatePoseidonHash as jest.Mock).mockResolvedValue(BigInt('123456789'));
    (poseidonModule.poseidonHashToHex as jest.Mock).mockReturnValue('0x123456789abcdef');
    (poseidonModule.splitHashForCircuit as jest.Mock).mockReturnValue([BigInt(1234), BigInt(5678)]);
  });

  test('renders with correct title', () => {
    render(<HashVerifier />);

    // Check that the component renders with title
    expect(screen.getByText('Hash Verifier')).toBeInTheDocument();
  });

  test('displays input fields for hash verification', () => {
    render(<HashVerifier />);

    // Check that the form fields are displayed
    expect(screen.getByLabelText(/input 1/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/input 2 \(optional\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/input 3 \(optional\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/input 4 \(optional\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/use custom expected hash/i)).toBeInTheDocument();
  });

  test('has verify and sample buttons', () => {
    render(<HashVerifier />);

    // Check that buttons are present
    expect(screen.getByTestId('verify-button')).toHaveTextContent(/verify hash/i);
    expect(screen.getByTestId('load-sample-button')).toHaveTextContent(/load sample values/i);
  });

  test('loads sample values when button is clicked', async () => {
    render(<HashVerifier />);

    // Click on load sample button
    const loadSampleButton = screen.getByTestId('load-sample-button');
    fireEvent.click(loadSampleButton);

    // Check that the input fields are populated
    await waitFor(() => {
      const input1 = screen.getByTestId('input1');
      const input2 = screen.getByTestId('input2');
      const input3 = screen.getByTestId('input3');
      const input4 = screen.getByTestId('input4');

      expect((input1 as HTMLInputElement).value).not.toBe('');
      expect((input2 as HTMLInputElement).value).not.toBe('');
      expect((input3 as HTMLInputElement).value).not.toBe('');
      expect((input4 as HTMLInputElement).value).not.toBe('');
    });
  });

  test('submits form correctly', async () => {
    render(<HashVerifier />);

    // Fill in the input fields
    const input1 = screen.getByTestId('input1');
    const input2 = screen.getByTestId('input2');
    const input3 = screen.getByTestId('input3');
    const input4 = screen.getByTestId('input4');

    fireEvent.change(input1, { target: { value: '123' } });
    fireEvent.change(input2, { target: { value: '456' } });
    fireEvent.change(input3, { target: { value: '789' } });
    fireEvent.change(input4, { target: { value: '101112' } });

    // Submit the form
    const verifyButton = screen.getByTestId('verify-button');
    fireEvent.click(verifyButton);

    // Check that calculatePoseidonHash and generateAndVerifyProof were called
    await waitFor(() => {
      expect(poseidonModule.calculatePoseidonHash).toHaveBeenCalled();
      expect(mockGenerateAndVerifyProof).toHaveBeenCalled();
    });
  });

  test('shows custom hash input field when checkbox is checked', async () => {
    render(<HashVerifier />);

    // Check the custom hash checkbox
    const customHashCheckbox = screen.getByTestId('custom-hash-checkbox');
    fireEvent.click(customHashCheckbox);

    // Check that the expected hash input field is displayed
    await waitFor(() => {
      expect(screen.getByTestId('expected-hash-input')).toBeInTheDocument();
    });
  });

  test('shows loading state during verification', async () => {
    // Update mock to show loading
    (useCircuitVerificationModule.useCircuitVerification as jest.Mock).mockReturnValue({
      loading: true,
      error: null,
      result: null,
      resultCode: null,
      resultMessage: null,
      generateAndVerifyProof: mockGenerateAndVerifyProof,
      reset: mockReset,
      circuitReady: true,
      proof: null,
      publicSignals: null,
    });

    render(<HashVerifier />);

    // Check loading state is displayed on the button
    expect(screen.getByTestId('verify-button')).toHaveTextContent(/verifying/i);
  });

  test('shows verification result when available', async () => {
    // Update mock to show a successful result
    (useCircuitVerificationModule.useCircuitVerification as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      result: { success: true },
      resultCode: 1,
      resultMessage: 'Hash verification successful',
      generateAndVerifyProof: mockGenerateAndVerifyProof,
      reset: mockReset,
      circuitReady: true,
      proof: {
        pi_a: ['1', '2'],
        pi_b: [
          ['3', '4'],
          ['5', '6'],
        ],
        pi_c: ['7', '8'],
        protocol: 'groth16',
        curve: 'bn128',
      },
      publicSignals: ['1', '2', '3'],
    });

    render(<HashVerifier />);

    // Check success message is displayed
    expect(screen.getByText(/hash verification successful/i)).toBeInTheDocument();
  });

  test('shows error message when circuit files are not available', () => {
    // Mock circuit not ready
    (useCircuitVerificationModule.useCircuitVerification as jest.Mock).mockReturnValue({
      loading: false,
      error: 'Circuit files not available',
      result: null,
      resultCode: null,
      resultMessage: null,
      generateAndVerifyProof: mockGenerateAndVerifyProof,
      reset: mockReset,
      circuitReady: false,
      proof: null,
      publicSignals: null,
    });

    render(<HashVerifier />);

    // Check error message is displayed
    expect(screen.getByText(/circuit files not available/i)).toBeInTheDocument();
  });

  test('resets form when Reset button is clicked', async () => {
    // Mock with result to show reset button
    (useCircuitVerificationModule.useCircuitVerification as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      result: { success: true },
      resultCode: 1,
      resultMessage: 'Hash verification successful',
      generateAndVerifyProof: mockGenerateAndVerifyProof,
      reset: mockReset,
      circuitReady: true,
      proof: null,
      publicSignals: null,
    });

    render(<HashVerifier />);

    // Click reset button
    const resetButton = screen.getByRole('button', { name: /Reset/i });
    fireEvent.click(resetButton);

    // Check reset was called
    await waitFor(() => {
      expect(mockReset).toHaveBeenCalled();
    });
  });
});
