import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CircomPage from '@/app/(patient)/circom/page';

// Only mock the circuit verification hook
jest.mock('@/features/circom/hooks/useCircuitVerification', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    loading: false,
    error: null,
    result: null,
    resultCode: null,
    resultMessage: null,
    generateAndVerifyProof: jest.fn(),
    reset: jest.fn(),
    circuitReady: true,
    proof: null,
    publicSignals: null,
  })),
}));

describe('Circom Verifiers Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the page with title and verifier components', async () => {
    render(<CircomPage />);

    // Check page title
    expect(screen.getByText('Zero-Knowledge Proof Verifiers')).toBeInTheDocument();

    // Check that verifier headings are displayed
    await waitFor(() => {
      expect(screen.getByText('Age Verification')).toBeInTheDocument();
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });
  });

  test('navigates between verifier tabs', async () => {
    render(<CircomPage />);

    // By default, Age verifier should be active
    expect(screen.getByText('Age Verification')).toBeInTheDocument();

    // Click on FHIR tab
    const fhirTab = screen.getByRole('tab', { name: /fhir verifier/i });
    fireEvent.click(fhirTab);

    // FHIR content should be displayed
    await waitFor(() => {
      expect(screen.getByText('FHIR Resource Verification')).toBeInTheDocument();
    });

    // Click on Hash tab
    const hashTab = screen.getByRole('tab', { name: /hash verifier/i });
    fireEvent.click(hashTab);

    // Hash content should be displayed
    await waitFor(() => {
      expect(screen.getByText('Hash Verification')).toBeInTheDocument();
    });

    // Click back to Age tab
    const ageTab = screen.getByRole('tab', { name: /age verifier/i });
    fireEvent.click(ageTab);

    // Age content should be displayed again
    await waitFor(() => {
      expect(screen.getByText('Age Verification')).toBeInTheDocument();
    });
  });

  test('displays correct form components for each verifier', async () => {
    render(<CircomPage />);

    // Age verifier should have Simple Age Verification radio button
    expect(screen.getByLabelText(/simple age verification/i)).toBeInTheDocument();

    // Switch to FHIR verifier
    const fhirTab = screen.getByRole('tab', { name: /fhir verifier/i });
    fireEvent.click(fhirTab);

    // FHIR verifier should have Resource Type Verification radio button
    await waitFor(() => {
      expect(screen.getByLabelText(/resource type verification/i)).toBeInTheDocument();
    });

    // Switch to Hash verifier
    const hashTab = screen.getByRole('tab', { name: /hash verifier/i });
    fireEvent.click(hashTab);

    // Hash verifier should have input fields
    await waitFor(() => {
      expect(screen.getByTestId('input1')).toBeInTheDocument();
    });
  });
});
