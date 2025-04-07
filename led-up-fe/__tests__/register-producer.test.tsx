// import React from 'react';
// import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import '@testing-library/jest-dom';
// import RegisterProducerPage from '@/app/(demo)/register-producer/page';
// import { registerProducer } from '@/features/data-registry/actions/mutation';
// import { RecordStatus, ConsentStatus } from '@/features/data-registry/types';

// // Mock the registerProducer function
// jest.mock('../actions/data-registry/mutation', () => ({
//   registerProducer: jest.fn(),
// }));

// // Mock the toast component
// jest.mock('../components/ui/use-toast', () => ({
//   toast: jest.fn(),
// }));

// describe('RegisterProducerPage', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it('renders the form correctly', () => {
//     render(<RegisterProducerPage />);

//     // Check if the form elements are rendered
//     expect(screen.getByText('Register Producer')).toBeInTheDocument();
//     expect(screen.getByLabelText('Record Status')).toBeInTheDocument();
//     expect(screen.getByLabelText('Consent Status')).toBeInTheDocument();
//     expect(screen.getByLabelText('Private Key')).toBeInTheDocument();
//     expect(screen.getByRole('button', { name: 'Register Producer' })).toBeInTheDocument();
//   });

//   it('shows error when submitting without private key', async () => {
//     render(<RegisterProducerPage />);

//     // Submit the form without entering a private key
//     fireEvent.click(screen.getByRole('button', { name: 'Register Producer' }));

//     // Check if error message is displayed
//     expect(await screen.findByText('Private key is required')).toBeInTheDocument();
//   });

//   it('shows error for invalid private key format', async () => {
//     render(<RegisterProducerPage />);

//     // Enter an invalid private key
//     fireEvent.change(screen.getByLabelText('Private Key'), { target: { value: 'invalid-key' } });

//     // Submit the form
//     fireEvent.click(screen.getByRole('button', { name: 'Register Producer' }));

//     // Check if error message is displayed
//     expect(
//       await screen.findByText('Invalid private key format. It should be a 0x-prefixed 64-character hex string')
//     ).toBeInTheDocument();
//   });

//   it('submits the form successfully', async () => {
//     // Mock successful response
//     const mockHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
//     (registerProducer as jest.Mock).mockResolvedValue({
//       success: true,
//       hash: mockHash,
//     });

//     render(<RegisterProducerPage />);

//     // Enter a valid private key
//     fireEvent.change(screen.getByLabelText('Private Key'), {
//       target: { value: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' },
//     });

//     // Submit the form
//     fireEvent.click(screen.getByRole('button', { name: 'Register Producer' }));

//     // Check if the registerProducer function was called with the correct arguments
//     await waitFor(() => {
//       expect(registerProducer).toHaveBeenCalledWith(
//         RecordStatus.ACTIVE,
//         ConsentStatus.PENDING,
//         '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
//       );
//     });

//     // Check if success message is displayed
//     expect(await screen.findByText('Producer registered successfully!')).toBeInTheDocument();
//     expect(await screen.findByText(mockHash)).toBeInTheDocument();
//   });

//   it('handles transaction failure', async () => {
//     // Mock failed response
//     const errorMessage = 'Transaction failed';
//     (registerProducer as jest.Mock).mockResolvedValue({
//       success: false,
//       error: errorMessage,
//     });

//     render(<RegisterProducerPage />);

//     // Enter a valid private key
//     fireEvent.change(screen.getByLabelText('Private Key'), {
//       target: { value: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' },
//     });

//     // Submit the form
//     fireEvent.click(screen.getByRole('button', { name: 'Register Producer' }));

//     // Check if error message is displayed
//     expect(await screen.findByText(errorMessage)).toBeInTheDocument();
//   });

//   it('handles exception during submission', async () => {
//     // Mock exception
//     const errorMessage = 'Network error';
//     (registerProducer as jest.Mock).mockRejectedValue(new Error(errorMessage));

//     render(<RegisterProducerPage />);

//     // Enter a valid private key
//     fireEvent.change(screen.getByLabelText('Private Key'), {
//       target: { value: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' },
//     });

//     // Submit the form
//     fireEvent.click(screen.getByRole('button', { name: 'Register Producer' }));

//     // Check if error message is displayed
//     expect(await screen.findByText(errorMessage)).toBeInTheDocument();
//   });
// });
