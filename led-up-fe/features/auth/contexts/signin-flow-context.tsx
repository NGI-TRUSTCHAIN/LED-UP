import { createContext, useContext, useState, ReactNode } from 'react';
import { ConsentStatus, RecordStatus } from '@/features/data-registry';

interface SigninFlowContextType {
  isProcessing: boolean;
  privateKey: string;
  publicKey: string;
  didDocument: string;
  didIdentifier: string;
  didCreated: boolean;
  showDidCreationForm: boolean;
  producerError: string;
  producerTransactionHash: string | null;
  producerIsSuccess: boolean;
  status: RecordStatus;
  consent: ConsentStatus;
  setPrivateKey: (key: string) => void;
  setPublicKey: (key: string) => void;
  setDidDocument: (doc: string) => void;
  setDidIdentifier: (id: string) => void;
  setDidCreated: (created: boolean) => void;
  setShowDidCreationForm: (show: boolean) => void;
  setProducerError: (error: string) => void;
  setProducerTransactionHash: (hash: string | null) => void;
  setProducerIsSuccess: (success: boolean) => void;
  setStatus: (status: RecordStatus) => void;
  setConsent: (consent: ConsentStatus) => void;
  setIsProcessing: (processing: boolean) => void;
  resetSigninFlow: () => void;
}

const SigninFlowContext = createContext<SigninFlowContextType | undefined>(undefined);

export function SigninFlowProvider({ children }: { children: ReactNode }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [privateKey, setPrivateKey] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [didDocument, setDidDocument] = useState('');
  const [didIdentifier, setDidIdentifier] = useState('');
  const [didCreated, setDidCreated] = useState(false);
  const [showDidCreationForm, setShowDidCreationForm] = useState(false);
  const [producerError, setProducerError] = useState('');
  const [producerTransactionHash, setProducerTransactionHash] = useState<string | null>(null);
  const [producerIsSuccess, setProducerIsSuccess] = useState(false);
  const [status, setStatus] = useState<RecordStatus>(RecordStatus.Active);
  const [consent, setConsent] = useState<ConsentStatus>(ConsentStatus.NotSet);

  const resetSigninFlow = () => {
    setPrivateKey('');
    setPublicKey('');
    setDidDocument('');
    setDidIdentifier('');
    setDidCreated(false);
    setShowDidCreationForm(false);
    setProducerError('');
    setProducerTransactionHash(null);
    setProducerIsSuccess(false);
    setStatus(RecordStatus.Active);
    setConsent(ConsentStatus.NotSet);
    setIsProcessing(false);
  };

  return (
    <SigninFlowContext.Provider
      value={{
        isProcessing,
        privateKey,
        publicKey,
        didDocument,
        didIdentifier,
        didCreated,
        showDidCreationForm,
        producerError,
        producerTransactionHash,
        producerIsSuccess,
        status,
        consent,
        setPrivateKey,
        setPublicKey,
        setDidDocument,
        setDidIdentifier,
        setDidCreated,
        setShowDidCreationForm,
        setProducerError,
        setProducerTransactionHash,
        setProducerIsSuccess,
        setStatus,
        setConsent,
        setIsProcessing,
        resetSigninFlow,
      }}
    >
      {children}
    </SigninFlowContext.Provider>
  );
}

export function useSigninFlow() {
  const context = useContext(SigninFlowContext);
  if (context === undefined) {
    throw new Error('useSigninFlow must be used within a SigninFlowProvider');
  }
  return context;
}
