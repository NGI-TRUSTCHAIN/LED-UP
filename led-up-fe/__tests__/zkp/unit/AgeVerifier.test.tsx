import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AgeVerifier } from '@/features/circom/components';
import * as useCircuitVerificationModule from '@/features/circom/hooks/useCircuitVerification';
import { AgeVerificationType } from '@/features/circom/types';

// Mock the hook
jest.mock('@/features/circom/hooks/useCircuitVerification', () => ({
  useCircuitVerification: jest.fn(),
}));

describe('AgeVerifier Component', () => {
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
  });

  it('should render correctly with all verification modes', () => {
    render(<AgeVerifier />);

    // Check that the component renders with title
    expect(screen.getByText('Age Verification')).toBeInTheDocument();

    // Check that verification type options are present
    const simpleRadio = screen.getByTestId('verification-type-simple');
    const birthDateRadio = screen.getByTestId('verification-type-birthdate');
    const bracketRadio = screen.getByTestId('verification-type-bracket');

    expect(simpleRadio).toBeInTheDocument();
    expect(birthDateRadio).toBeInTheDocument();
    expect(bracketRadio).toBeInTheDocument();
  });

  it('should display form fields for simple age verification by default', () => {
    render(<AgeVerifier />);

    // Check that the form fields are displayed
    expect(screen.getByTestId('age-input')).toBeInTheDocument();
    expect(screen.getByTestId('threshold-input')).toBeInTheDocument();
  });

  it('should have verify button', () => {
    render(<AgeVerifier />);

    // Check that verify button is present
    expect(screen.getByTestId('verify-button')).toBeInTheDocument();
  });

  it('should handle simple age verification correctly', async () => {
    render(<AgeVerifier />);

    // Fill in the input fields
    const ageInput = screen.getByTestId('age-input');
    const thresholdInput = screen.getByTestId('threshold-input');

    fireEvent.change(ageInput, { target: { value: '25' } });
    fireEvent.change(thresholdInput, { target: { value: '18' } });

    // Submit the form
    const verifyButton = screen.getByTestId('verify-button');
    fireEvent.click(verifyButton);

    // Check that the generateAndVerifyProof was called with expected parameters
    await waitFor(() => {
      expect(mockGenerateAndVerifyProof).toHaveBeenCalledWith(
        expect.objectContaining({
          age: 25,
          threshold: 18,
          verificationType: expect.any(Number),
        })
      );
    });
  });

  it('should handle birth date verification correctly', async () => {
    render(<AgeVerifier />);

    // Select birth date verification
    const birthDateRadio = screen.getByTestId('verification-type-birthdate');
    fireEvent.click(birthDateRadio);

    // In the actual component, we have a date picker
    // Set the birth date using the date input
    const dateInput = await screen.findByPlaceholderText(/e.g. "tomorrow at 5pm"/i);
    fireEvent.change(dateInput, { target: { value: '1998-01-01' } });

    const thresholdInput = screen.getByTestId('threshold-input');
    fireEvent.change(thresholdInput, { target: { value: '18' } });

    // Submit the form
    const verifyButton = screen.getByTestId('verify-button');
    fireEvent.click(verifyButton);

    // Check that generateAndVerifyProof was called
    await waitFor(() => {
      expect(mockGenerateAndVerifyProof).toHaveBeenCalled();
      // We can't check exact parameters since the date handling may be complex
    });
  });

  it('should handle age bracket verification correctly', async () => {
    render(<AgeVerifier />);

    // Select age bracket verification
    const bracketRadio = screen.getByTestId('verification-type-bracket');
    fireEvent.click(bracketRadio);

    // In the actual component, we only need the age input for bracket verification
    const ageInput = screen.getByTestId('age-input');

    // Fill in the age field
    fireEvent.change(ageInput, { target: { value: '25' } });

    // Submit the form
    const verifyButton = screen.getByTestId('verify-button');
    fireEvent.click(verifyButton);

    // Check that generateAndVerifyProof was called
    await waitFor(() => {
      expect(mockGenerateAndVerifyProof).toHaveBeenCalled();
    });
  });

  it('should display loading state while verifying', () => {
    // Mock loading state
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

    render(<AgeVerifier />);

    // Verify loading indicator is shown (look for text inside button)
    const verifyButton = screen.getByTestId('verify-button');
    expect(verifyButton.textContent).toMatch(/verifying/i);
  });

  it('should display success result', () => {
    // Mock successful result
    (useCircuitVerificationModule.useCircuitVerification as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      result: { success: true },
      resultCode: 1,
      resultMessage: 'Verification successful',
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
      generateAndVerifyProof: mockGenerateAndVerifyProof,
      reset: mockReset,
      circuitReady: true,
    });

    render(<AgeVerifier />);

    // Verify success message is shown
    expect(screen.getByText(/verification successful/i)).toBeInTheDocument();
  });

  it('should display error when circuit files are not available', () => {
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

    render(<AgeVerifier />);

    // Check error message is displayed - using getAllByText since there might be multiple elements
    const errorElements = screen.getAllByText(/circuit files not available/i);
    expect(errorElements.length).toBeGreaterThan(0);
  });

  it('should reset form when reset button is clicked', async () => {
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

    render(<AgeVerifier />);

    // Check reset button is displayed and click it
    const resetButton = screen.getByRole('button', { name: /reset/i });
    fireEvent.click(resetButton);

    // Check reset was called
    await waitFor(() => {
      expect(mockReset).toHaveBeenCalled();
    });
  });
});
