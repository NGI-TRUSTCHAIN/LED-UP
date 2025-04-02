'use client';

import { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { useAccount } from 'wagmi';

// Define the registration steps
export enum RegistrationStep {
  CONNECT_WALLET = 0,
  REGISTER_DID = 1,
  AUTHENTICATE_DID = 2,
  REGISTER_ROLE = 3,
  REGISTER_PRODUCER = 4, // Only for producers
  COMPLETE = 5,
}

// Define the registration context type
interface RegistrationContextType {
  currentStep: RegistrationStep;
  userType: 'consumer' | 'producer';
  did: string | null;
  isWalletConnected: boolean;
  isAuthenticated: boolean;
  isRegistered: boolean;
  isProducerRegistered: boolean;
  error: string | null;
  setUserType: (type: 'consumer' | 'producer') => void;
  setCurrentStep: (step: RegistrationStep) => void;
  setDid: (did: string | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setIsRegistered: (isRegistered: boolean) => void;
  setIsProducerRegistered: (isRegistered: boolean) => void;
  setError: (error: string | null) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetRegistration: () => void;
}

// Create the context with default values
const RegistrationContext = createContext<RegistrationContextType>({
  currentStep: RegistrationStep.CONNECT_WALLET,
  userType: 'consumer',
  did: null,
  isWalletConnected: false,
  isAuthenticated: false,
  isRegistered: false,
  isProducerRegistered: false,
  error: null,
  setUserType: () => {},
  setCurrentStep: () => {},
  setDid: () => {},
  setIsAuthenticated: () => {},
  setIsRegistered: () => {},
  setIsProducerRegistered: () => {},
  setError: () => {},
  nextStep: () => {},
  prevStep: () => {},
  resetRegistration: () => {},
});

// Provider component
export function RegistrationProvider({ children }: { children: ReactNode }) {
  const { isConnected } = useAccount();
  const [currentStep, setCurrentStep] = useState<RegistrationStep>(RegistrationStep.CONNECT_WALLET);
  const [userType, setUserType] = useState<'consumer' | 'producer'>('consumer');
  const [did, setDid] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [isProducerRegistered, setIsProducerRegistered] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Move to the next step
  const nextStep = useCallback(() => {
    if (currentStep < RegistrationStep.COMPLETE) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep]);

  // Move to the previous step
  const prevStep = useCallback(() => {
    if (currentStep > RegistrationStep.CONNECT_WALLET) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  // Reset the registration process
  const resetRegistration = useCallback(() => {
    setCurrentStep(RegistrationStep.CONNECT_WALLET);
    setDid(null);
    setIsAuthenticated(false);
    setIsRegistered(false);
    setIsProducerRegistered(false);
    setError(null);
  }, []);

  // Update the current step based on wallet connection status
  useState(() => {
    if (isConnected && currentStep === RegistrationStep.CONNECT_WALLET) {
      setCurrentStep(RegistrationStep.REGISTER_DID);
    } else if (!isConnected && currentStep > RegistrationStep.CONNECT_WALLET) {
      setCurrentStep(RegistrationStep.CONNECT_WALLET);
    }
  });

  const contextValue: RegistrationContextType = {
    currentStep,
    userType,
    did,
    isWalletConnected: isConnected,
    isAuthenticated,
    isRegistered,
    isProducerRegistered,
    error,
    setUserType,
    setCurrentStep,
    setDid,
    setIsAuthenticated,
    setIsRegistered,
    setIsProducerRegistered,
    setError,
    nextStep,
    prevStep,
    resetRegistration,
  };

  return <RegistrationContext.Provider value={contextValue}>{children}</RegistrationContext.Provider>;
}

// Hook to use the registration context
export function useRegistration() {
  return useContext(RegistrationContext);
}
