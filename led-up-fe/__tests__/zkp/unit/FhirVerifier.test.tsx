import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FhirVerifier } from '@/features/circom/components';
import * as useCircuitVerificationModule from '@/features/circom/hooks/useCircuitVerification';
import * as poseidonModule from '@/features/circom/utils/poseidon';

// Mock TextEncoder if not available in test environment
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = class TextEncoder {
    encode(text: string) {
      const encoder = {
        // Simple implementation that works for ASCII
        // @ts-ignore
        encode: (str: string) => Uint8Array.from([...str].map((c) => c.charCodeAt(0))),
      };
      return encoder.encode(text);
    }
  } as any;
}

// Mock the hooks and utilities
jest.mock('@/features/circom/hooks/useCircuitVerification', () => ({
  useCircuitVerification: jest.fn(),
}));

jest.mock('@/features/circom/utils/poseidon', () => ({
  calculatePoseidonHash: jest.fn(),
  poseidonHashToHex: jest.fn(),
  splitHashForCircuit: jest.fn(),
  initializePoseidon: jest.fn(),
}));

describe('FhirVerifier Component', () => {
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

  it('renders with correct title and verification modes', () => {
    render(<FhirVerifier />);

    // Check that the component renders with title
    expect(screen.getByText('FHIR Verifier')).toBeInTheDocument();

    // Check that verification mode options are present
    expect(screen.getByText(/resource type only/i)).toBeInTheDocument();
    expect(screen.getByText(/field validation/i)).toBeInTheDocument();
    expect(screen.getByText(/hash verification/i)).toBeInTheDocument();
  });

  it('displays resource type verification form by default', () => {
    render(<FhirVerifier />);

    // Check that resource type form fields are displayed
    expect(screen.getByTestId('resource-type-select')).toBeInTheDocument();
    expect(screen.getByTestId('resource-data-input')).toBeInTheDocument();
  });

  it('changes form fields when different verification mode is selected', async () => {
    render(<FhirVerifier />);

    // Select hash verification mode
    const hashVerificationRadio = screen.getByTestId('verification-mode-hash');
    fireEvent.click(hashVerificationRadio);

    // Check that hash verification fields are now visible
    await waitFor(() => {
      expect(screen.getByTestId('resource-json-input')).toBeInTheDocument();
      expect(screen.getByTestId('expected-hash-input')).toBeInTheDocument();
    });
  });

  it('loads sample values when button is clicked', async () => {
    render(<FhirVerifier />);

    // Click on load sample button
    const loadSampleButton = screen.getByTestId('load-sample-button');
    fireEvent.click(loadSampleButton);

    // Check that the input fields are populated
    await waitFor(() => {
      const resourceDataInput = screen.getByTestId('resource-data-input');
      expect((resourceDataInput as HTMLInputElement).value).toBe('1,0,0,0,0,0,0,0');
    });
  });

  it('submits resource type verification form correctly', async () => {
    render(<FhirVerifier />);

    // Load sample data
    const loadSampleButton = screen.getByTestId('load-sample-button');
    fireEvent.click(loadSampleButton);

    // Submit the form
    const verifyButton = screen.getByTestId('verify-button');
    fireEvent.click(verifyButton);

    // Check that the generateAndVerifyProof was called
    await waitFor(() => {
      expect(mockGenerateAndVerifyProof).toHaveBeenCalled();
    });
  });

  it('submits hash verification form correctly', async () => {
    render(<FhirVerifier />);

    // Select hash verification mode
    const hashVerificationRadio = screen.getByTestId('verification-mode-hash');
    fireEvent.click(hashVerificationRadio);

    // Wait for form fields to update
    await waitFor(() => {
      expect(screen.getByTestId('resource-json-input')).toBeInTheDocument();
    });

    // Manually fill form fields instead of using load sample
    const jsonInput = screen.getByTestId('resource-json-input');
    const hashInput = screen.getByTestId('expected-hash-input');

    fireEvent.change(jsonInput, { target: { value: '{"resourceType":"Patient","id":"test"}' } });
    fireEvent.change(hashInput, { target: { value: '0x123456789abcdef' } });

    // Submit the form
    const verifyButton = screen.getByTestId('verify-button');
    fireEvent.click(verifyButton);

    // Check that generateAndVerifyProof was called
    await waitFor(() => {
      expect(mockGenerateAndVerifyProof).toHaveBeenCalled();
    });
  });

  it('shows loading state during verification', () => {
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

    render(<FhirVerifier />);

    // Check loading state is displayed
    expect(screen.getByText(/verifying/i)).toBeInTheDocument();
  });

  it('shows verification result when available', () => {
    // Update mock to show a successful result
    (useCircuitVerificationModule.useCircuitVerification as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      result: { success: true },
      resultCode: 1,
      resultMessage: 'Verification successful',
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

    render(<FhirVerifier />);

    // Check success message is displayed
    expect(screen.getByText(/verification successful/i)).toBeInTheDocument();
  });

  it('shows error message when circuit files are not available', () => {
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

    render(<FhirVerifier />);

    // Check error message is displayed
    expect(screen.getByText(/circuit files not available/i)).toBeInTheDocument();
  });

  it('resets form when reset button is clicked', async () => {
    // Mock with result to show reset button
    (useCircuitVerificationModule.useCircuitVerification as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      result: { success: true },
      resultCode: 1,
      resultMessage: 'Verification successful',
      generateAndVerifyProof: mockGenerateAndVerifyProof,
      reset: mockReset,
      circuitReady: true,
      proof: null,
      publicSignals: null,
    });

    render(<FhirVerifier />);

    // Check reset button is displayed and click it
    const resetButton = screen.getByRole('button', { name: /reset/i });
    fireEvent.click(resetButton);

    // Check reset was called
    await waitFor(() => {
      expect(mockReset).toHaveBeenCalled();
    });
  });
});
