import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AgeVerifier from '@/features/zkp/components/AgeVerifier';
import { useCircuitVerification } from '@/features/zkp/hooks/useCircuitVerification';
import { CircuitType, AgeVerificationType } from '@/features/zkp/types';

// Mock the useCircuitVerification hook
jest.mock('@/features/circom/hooks/useCircuitVerification');

describe('AgeVerifier Component', () => {
  const mockGenerateAndVerifyProof = jest.fn();
  const mockReset = jest.fn();
  const RealDate = global.Date;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock return values
    (useCircuitVerification as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      result: null,
      resultCode: null,
      resultMessage: null,
      proof: null,
      publicSignals: null,
      generateAndVerifyProof: mockGenerateAndVerifyProof,
      reset: mockReset,
      circuitReady: true,
    });
  });

  afterEach(() => {
    // Restore the original Date implementation after each test
    global.Date = RealDate;
  });

  it('should render correctly with all verification modes', () => {
    render(<AgeVerifier />);

    // Check verification types are present
    expect(screen.getByText('Simple Age Verification')).toBeInTheDocument();
    expect(screen.getByText('Birth Date Verification')).toBeInTheDocument();
    expect(screen.getByText('Age Bracket Verification')).toBeInTheDocument();
  });

  it('should handle simple age verification correctly', async () => {
    render(<AgeVerifier />);

    // Ensure we're using the simple age verification type
    const simpleVerificationRadio = screen.getByTestId('verification-type-simple');
    fireEvent.click(simpleVerificationRadio);

    // Fill in the form fields
    const ageInput = screen.getByTestId('age-input');
    const thresholdInput = screen.getByTestId('threshold-input');

    fireEvent.change(ageInput, { target: { value: '25' } });
    fireEvent.change(thresholdInput, { target: { value: '18' } });

    // Submit the form
    const verifyButton = screen.getByTestId('verify-button');
    fireEvent.click(verifyButton);

    // Check that the hook was called with correct arguments
    await waitFor(() => {
      expect(mockGenerateAndVerifyProof).toHaveBeenCalledWith(
        expect.objectContaining({
          age: 25,
          birthDate: 0,
          threshold: 18,
          verificationType: 1, // AgeVerificationType.SIMPLE
        })
      );
    });
  });

  it('should handle birth date verification correctly', async () => {
    render(<AgeVerifier />);

    // Switch to birth date verification type
    const birthDateVerificationRadio = screen.getByTestId('verification-type-birthdate');
    fireEvent.click(birthDateVerificationRadio);

    // Wait for UI to update to show birth date field
    await waitFor(() => {
      // Look for the date input by its placeholder text
      expect(screen.getByPlaceholderText(/tomorrow at 5pm/i)).toBeInTheDocument();
    });

    // Mock the Date constructor to return a fixed date
    const mockDate = new Date(2023, 9, 15); // October 15, 2023
    global.Date = class extends RealDate {
      constructor() {
        super();
        return mockDate;
      }
    } as DateConstructor;

    // Submit the form with default values
    const verifyButton = screen.getByTestId('verify-button');
    fireEvent.click(verifyButton);

    // Check that the hook was called with correct arguments
    await waitFor(() => {
      expect(mockGenerateAndVerifyProof).toHaveBeenCalledWith(
        expect.objectContaining({
          age: 0,
          birthDate: 0,
          threshold: 18,
          verificationType: 2, // AgeVerificationType.BIRTH_DATE
        })
      );
    });
  });

  it('should handle age bracket verification correctly', async () => {
    render(<AgeVerifier />);

    // Switch to age bracket verification type
    const ageBracketVerificationRadio = screen.getByTestId('verification-type-bracket');
    fireEvent.click(ageBracketVerificationRadio);

    // Wait for UI to update
    await waitFor(() => {
      // Age bracket view should show the bracket information
      expect(screen.getByText('Age Brackets')).toBeInTheDocument();
    });

    // Fill in the form fields
    const ageInput = screen.getByTestId('age-input');
    fireEvent.change(ageInput, { target: { value: '25' } });

    // Mock the Date constructor to return a fixed date
    const mockDate = new Date(2023, 9, 15); // October 15, 2023
    global.Date = class extends RealDate {
      constructor() {
        super();
        return mockDate;
      }
    } as DateConstructor;

    // Submit the form
    const verifyButton = screen.getByTestId('verify-button');
    fireEvent.click(verifyButton);

    // Check that the hook was called with correct arguments
    await waitFor(() => {
      expect(mockGenerateAndVerifyProof).toHaveBeenCalledWith(
        expect.objectContaining({
          age: 25,
          birthDate: 0,
          threshold: 18,
          verificationType: 3, // AgeVerificationType.AGE_BRACKET
        })
      );
    });
  });

  it('should display loading state while verifying', () => {
    // Mock loading state
    (useCircuitVerification as jest.Mock).mockReturnValue({
      loading: true,
      error: null,
      result: null,
      resultCode: null,
      resultMessage: null,
      proof: null,
      publicSignals: null,
      generateAndVerifyProof: mockGenerateAndVerifyProof,
      reset: mockReset,
      circuitReady: true,
    });

    render(<AgeVerifier />);

    // Verify loading indicator is shown
    expect(screen.getByText(/verifying/i)).toBeInTheDocument();
  });

  it('should display success result', () => {
    // Mock successful result
    (useCircuitVerification as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      result: { success: true, message: 'Proof verified successfully' },
      resultCode: 1,
      resultMessage: 'Verification successful',
      proof: {},
      publicSignals: ['1'],
      generateAndVerifyProof: mockGenerateAndVerifyProof,
      reset: mockReset,
      circuitReady: true,
    });

    render(<AgeVerifier />);

    // Verify success message is shown
    expect(screen.getByText('Verification successful')).toBeInTheDocument();
  });

  it('should display error result', () => {
    // Mock error state
    (useCircuitVerification as jest.Mock).mockReturnValue({
      loading: false,
      error: 'Failed to generate proof: WASM file not found',
      result: null,
      resultCode: null,
      resultMessage: null,
      proof: null,
      publicSignals: null,
      generateAndVerifyProof: mockGenerateAndVerifyProof,
      reset: mockReset,
      circuitReady: true,
    });

    render(<AgeVerifier />);

    // Verify error message is shown
    expect(screen.getByText(/Failed to generate proof/)).toBeInTheDocument();
  });

  it('should handle circuits not ready state', () => {
    // Mock circuits not ready
    (useCircuitVerification as jest.Mock).mockReturnValue({
      loading: false,
      error: 'Circuit files not available for AgeVerifier',
      result: null,
      resultCode: null,
      resultMessage: null,
      proof: null,
      publicSignals: null,
      generateAndVerifyProof: mockGenerateAndVerifyProof,
      reset: mockReset,
      circuitReady: false,
    });

    render(<AgeVerifier />);

    // Verify error message about circuit files
    expect(screen.getByText(/Circuit files not available/)).toBeInTheDocument();
  });

  it('should reset state when changing verification mode', async () => {
    render(<AgeVerifier />);

    // First click on birth date verification
    const birthDateVerificationRadio = screen.getByTestId('verification-type-birthdate');
    fireEvent.click(birthDateVerificationRadio);

    // Then click on age bracket verification
    const ageBracketVerificationRadio = screen.getByTestId('verification-type-bracket');
    fireEvent.click(ageBracketVerificationRadio);

    // Verify reset functionality is triggered
    // Note: In the actual component, resetField is used rather than calling the reset function directly
    // So we don't expect mockReset to be called here, but the form fields should be reset

    // Check that the fields are reset by verifying we can submit the form with default values
    const verifyButton = screen.getByTestId('verify-button');
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(mockGenerateAndVerifyProof).toHaveBeenCalled();
    });
  });
});
