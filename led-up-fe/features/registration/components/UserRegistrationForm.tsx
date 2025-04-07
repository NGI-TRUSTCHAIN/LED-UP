'use client';

import { useState, useEffect } from 'react';
import { useFormState } from 'react-dom';
import { useAccount } from 'wagmi';
import { Loader2, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useRegistration, RegistrationStep } from '../contexts/registration-provider';
import { useBlockchainRegistration } from '../hooks/useBlockchainRegistration';
import { RecordStatus, ConsentStatus, RegistrationResponse } from '../types';
import { registerDid, grantRole, registerProducer, authenticateDid as authenticateDidAction } from '../actions';

// UI Components
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import ConnectButton from '@/components/wallet-connect';

// Initial state for form submissions
const initialState: RegistrationResponse = {
  success: false,
  data: null,
  error: null,
  message: null,
};

interface UserRegistrationFormProps {
  userType: 'consumer' | 'producer';
}

export function UserRegistrationForm({ userType }: UserRegistrationFormProps) {
  const { address, isConnected } = useAccount();
  const {
    currentStep,
    setCurrentStep,
    setDid,
    setIsAuthenticated,
    setIsRegistered,
    setIsProducerRegistered,
    nextStep,
    prevStep,
    error: contextError,
    setError,
  } = useRegistration();

  const {
    isLoading: isBlockchainLoading,
    error: blockchainError,
    generateDid,
    generateDidDocument,
    generatePublicKey,
    registerDid: registerDidOnChain,
    checkDid,
    authenticateDid,
    registerAsProducer,
    grantRole: grantRoleOnChain,
    didExists: didExistsFromHook,
  } = useBlockchainRegistration();

  const [isProcessing, setIsProcessing] = useState(false);
  const [didExists, setDidExists] = useState(false);
  const [progress, setProgress] = useState(0);

  // Form state for server actions
  const [didRegistrationState, didRegistrationAction] = useFormState(registerDid, initialState);
  const [roleGrantState, roleGrantAction] = useFormState(grantRole, initialState);
  const [producerRegistrationState, producerRegistrationAction] = useFormState(registerProducer, initialState);
  const [authenticationState, authenticationAction] = useFormState(authenticateDidAction, initialState);

  // Update progress based on current step
  useEffect(() => {
    const totalSteps = userType === 'producer' ? 5 : 4;
    const currentProgress = (currentStep / totalSteps) * 100;
    setProgress(currentProgress);
  }, [currentStep, userType]);

  // Check if DID exists when wallet is connected
  useEffect(() => {
    if (isConnected && address) {
      const checkDidExists = async () => {
        try {
          setIsProcessing(true);
          const did = generateDid();

          // If the blockchain hook already tells us if the DID exists
          if (didExistsFromHook !== undefined) {
            if (didExistsFromHook) {
              // DID exists, skip to authentication
              setDidExists(true);
              setDid(did);
              setCurrentStep(RegistrationStep.AUTHENTICATE_DID);
              toast.success('DID found. Proceeding to authentication.');
              return;
            } else {
              // DID doesn't exist, go to registration
              setDidExists(false);
              setDid(null);
              setCurrentStep(RegistrationStep.REGISTER_DID);
              toast.info('No DID found. Please register a new DID.');
              return;
            }
          }

          // Fallback to the old method if needed
          const result = await checkDid(did);

          if (result.success) {
            setDidExists(true);
            setDid(did);
            setCurrentStep(RegistrationStep.AUTHENTICATE_DID);
            toast.success('DID found. Proceeding to authentication.');
          } else if (result.data?.exists) {
            setDidExists(true);
            setDid(did);
            setCurrentStep(RegistrationStep.AUTHENTICATE_DID);
            toast.info('DID exists but may need authentication.');
          } else {
            setDidExists(false);
            setDid(null);
            setCurrentStep(RegistrationStep.REGISTER_DID);
            toast.info('No DID found. Please register a new DID.');
          }
        } catch (error: any) {
          console.error('Error checking DID:', error);
          setDidExists(false);
          setDid(null);
          setCurrentStep(RegistrationStep.REGISTER_DID);
          toast.error('Error checking DID: ' + error.message);
        } finally {
          setIsProcessing(false);
        }
      };

      checkDidExists();
    }
  }, [isConnected, address, checkDid, generateDid, setDid, setCurrentStep, didExistsFromHook]);

  // Handle DID registration
  const handleRegisterDid = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsProcessing(true);
    try {
      // First check if DID exists to avoid unnecessary blockchain transactions
      const did = generateDid();
      const didCheckResult = await checkDid(did);

      if (didCheckResult.success || (didCheckResult.data && didCheckResult.data.exists)) {
        // DID already exists, update UI state and move to authentication
        setDidExists(true);
        setDid(did);
        toast.info('DID already exists. Proceeding to authentication.');
        setCurrentStep(RegistrationStep.AUTHENTICATE_DID);
        setIsProcessing(false);
        return;
      }

      // Client-side blockchain interaction
      const result = await registerDidOnChain();

      if (result.success) {
        setDid(result.data.did);
        setDidExists(true);
        toast.success('DID registered successfully');

        // Also submit to server for record keeping, but skip signing
        const formData = new FormData();
        formData.append('did', result.data.did);
        formData.append('document', generateDidDocument());
        formData.append('publicKey', generatePublicKey());
        formData.append('skipSigning', 'true'); // Tell the server action to skip signing
        await didRegistrationAction(formData);

        // Move to authentication step after successful registration
        setCurrentStep(RegistrationStep.AUTHENTICATE_DID);
      } else {
        // Handle specific error cases
        if (result.error?.includes('already registered')) {
          setDidExists(true);
          setDid(did);
          toast.info('DID already exists. Proceeding to authentication.');
          setCurrentStep(RegistrationStep.AUTHENTICATE_DID);
        } else if (result.error?.includes('unauthorized')) {
          toast.error('Your wallet address is already associated with a different DID');
          setError('Your wallet address is already associated with a different DID. Please use a different wallet.');
        } else {
          toast.error(result.message || 'Failed to register DID');
          setError(result.error || 'Unknown error');
        }
      }
    } catch (error: any) {
      console.error('Error registering DID:', error);

      // Check for specific error messages
      if (error.message?.includes('already registered') || error.message?.includes('DIDAlreadyRegistered')) {
        setDidExists(true);
        setDid(generateDid());
        toast.info('DID already exists. Proceeding to authentication.');
        setCurrentStep(RegistrationStep.AUTHENTICATE_DID);
      } else if (error.message?.includes('unauthorized') || error.message?.includes('Unauthorized')) {
        toast.error('Your wallet address is already associated with a different DID');
        setError('Your wallet address is already associated with a different DID. Please use a different wallet.');
      } else {
        toast.error(error.message || 'Failed to register DID');
        setError(error.message || 'Unknown error');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle DID authentication
  const handleAuthenticateDid = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsProcessing(true);
    try {
      // Client-side blockchain interaction
      const result = await authenticateDid(userType);

      // Also submit to server for verification, but skip signing
      const formData = new FormData();
      formData.append('did', generateDid());
      formData.append('role', userType);
      formData.append('skipSigning', 'true'); // Tell the server action to skip signing
      await authenticationAction(formData);

      if (result.success && result.data?.isAuthenticated) {
        setIsAuthenticated(true);
        toast.success('DID authenticated successfully');

        if (userType === 'producer') {
          nextStep(); // Move to producer registration
        } else {
          setCurrentStep(RegistrationStep.COMPLETE); // Skip to completion for consumers
        }
      } else {
        // If authentication fails, we need to register the role
        setIsAuthenticated(false);
        toast.info('Authentication failed. Proceeding to role registration.');
        nextStep(); // Move to role registration step
      }
    } catch (error: any) {
      console.error('Error authenticating DID:', error);
      toast.error(error.message || 'Failed to authenticate DID');
      setError(error.message || 'Unknown error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle role registration
  const handleRegisterRole = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsProcessing(true);
    try {
      // Use the blockchain registration hook's grantRole function
      const result = await grantRoleOnChain(userType);

      if (result.success) {
        setIsRegistered(true);
        toast.success(`Registered as ${userType} successfully`);

        // Also submit to server for record keeping, but skip signing
        const formData = new FormData();
        formData.append('did', generateDid());
        formData.append('role', userType);
        formData.append('skipSigning', 'true'); // Tell the server action to skip signing
        await roleGrantAction(formData);

        if (userType === 'producer') {
          nextStep(); // Move to producer registration for producers
        } else {
          setCurrentStep(RegistrationStep.COMPLETE); // Skip to completion for consumers
        }
      } else {
        toast.error(result.message || `Failed to register as ${userType}`);
        setError(result.error || 'Unknown error');
      }
    } catch (error: any) {
      console.error('Error registering role:', error);
      toast.error(error.message || `Failed to register as ${userType}`);
      setError(error.message || 'Unknown error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle producer registration
  const handleRegisterProducer = async () => {
    if (!isConnected || !address || userType !== 'producer') {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsProcessing(true);
    try {
      // Use the blockchain registration hook's registerAsProducer function
      const result = await registerAsProducer();

      if (result.success) {
        setIsProducerRegistered(true);
        toast.success('Registered as producer successfully');

        // Also submit to server for record keeping, but skip signing
        const formData = new FormData();
        formData.append('ownerDid', generateDid());
        formData.append('producer', address);
        formData.append('status', RecordStatus.ACTIVE.toString());
        formData.append('consent', ConsentStatus.PENDING.toString());
        formData.append('skipSigning', 'true'); // Tell the server action to skip signing
        await producerRegistrationAction(formData);

        nextStep();
      } else {
        toast.error(result.message || 'Failed to register as producer');
        setError(result.error || 'Unknown error');
      }
    } catch (error: any) {
      console.error('Error registering as producer:', error);
      toast.error(error.message || 'Failed to register as producer');
      setError(error.message || 'Unknown error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Get step title based on current step
  const getStepTitle = () => {
    switch (currentStep) {
      case RegistrationStep.CONNECT_WALLET:
        return 'Connect Wallet';
      case RegistrationStep.REGISTER_DID:
        return 'Register DID';
      case RegistrationStep.AUTHENTICATE_DID:
        return 'Authenticate DID';
      case RegistrationStep.REGISTER_ROLE:
        return `Register as ${userType.charAt(0).toUpperCase() + userType.slice(1)}`;
      case RegistrationStep.REGISTER_PRODUCER:
        return 'Register Producer Data';
      case RegistrationStep.COMPLETE:
        return 'Registration Complete';
      default:
        return 'Registration';
    }
  };

  // Render different content based on the current step
  const renderStepContent = () => {
    switch (currentStep) {
      case RegistrationStep.CONNECT_WALLET:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Connect Your Wallet</CardTitle>
              <CardDescription>Connect your Ethereum wallet to begin the registration process</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <ConnectButton />
            </CardContent>
          </Card>
        );

      case RegistrationStep.REGISTER_DID:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Register DID</CardTitle>
              <CardDescription>Register a new decentralized identity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium">Your DID</p>
                <p className="text-xs font-mono break-all">{generateDid()}</p>
              </div>

              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="text-yellow-800">DID Not Registered</AlertTitle>
                <AlertDescription className="text-yellow-700">
                  Your DID is not registered yet. Please register it first.
                </AlertDescription>
              </Alert>

              {displayError && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-destructive">Troubleshooting</p>
                  <div className="rounded-md bg-muted p-3 text-xs">
                    <p className="font-medium">Common issues:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>Your wallet address may already be associated with a different DID</li>
                      <li>The DID may already be registered by another wallet</li>
                      <li>There might be a network connection issue</li>
                      <li>The smart contract might be paused or unavailable</li>
                    </ul>
                    <p className="mt-2 font-medium">Try these solutions:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>Try authenticating instead of registering</li>
                      <li>Use a different wallet address</li>
                      <li>Check your network connection</li>
                      <li>Refresh the page and try again</li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep} disabled={currentStep <= RegistrationStep.CONNECT_WALLET}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleRegisterDid} disabled={isProcessing || isBlockchainLoading}>
                {isProcessing || isBlockchainLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    Register DID
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
            {displayError && (
              <div className="p-4 pt-0">
                <Button
                  variant="ghost"
                  className="w-full text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  onClick={() => {
                    setDidExists(true);
                    setDid(generateDid());
                    setCurrentStep(RegistrationStep.AUTHENTICATE_DID);
                  }}
                >
                  Skip registration and try authentication instead
                </Button>
              </div>
            )}
          </Card>
        );

      case RegistrationStep.AUTHENTICATE_DID:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Authenticate DID</CardTitle>
              <CardDescription>Authenticate your decentralized identity to proceed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium">Your DID</p>
                <p className="text-xs font-mono break-all">{generateDid()}</p>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">DID Registered</AlertTitle>
                <AlertDescription className="text-blue-700">
                  Your DID is registered. You can now authenticate.
                </AlertDescription>
              </Alert>

              {displayError && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-destructive">Troubleshooting</p>
                  <div className="rounded-md bg-muted p-3 text-xs">
                    <p className="font-medium">Common issues:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>Your wallet address may already be associated with a different DID</li>
                      <li>The DID may already be registered by another wallet</li>
                      <li>There might be a network connection issue</li>
                      <li>The smart contract might be paused or unavailable</li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleAuthenticateDid} disabled={isProcessing || isBlockchainLoading}>
                {isProcessing || isBlockchainLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Authenticate DID
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        );

      case RegistrationStep.REGISTER_ROLE:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Register as {userType.charAt(0).toUpperCase() + userType.slice(1)}</CardTitle>
              <CardDescription>Register your DID with the {userType} role to access platform features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium">Your DID</p>
                <p className="text-xs font-mono break-all">{generateDid()}</p>
              </div>

              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="text-yellow-800">Role Registration Required</AlertTitle>
                <AlertDescription className="text-yellow-700">
                  Your DID needs to be registered as a {userType} to access the platform.
                </AlertDescription>
              </Alert>

              <div className="flex flex-col space-y-2">
                <p className="text-sm font-medium">Role</p>
                <Badge variant="outline" className="w-fit">
                  {userType.charAt(0).toUpperCase() + userType.slice(1)}
                </Badge>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleRegisterRole} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    Register Role
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        );

      case RegistrationStep.REGISTER_PRODUCER:
        if (userType !== 'producer') {
          return (
            <Card>
              <CardHeader>
                <CardTitle>Registration Complete</CardTitle>
                <CardDescription>You have successfully registered as a consumer</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Registration Complete</AlertTitle>
                  <AlertDescription className="text-green-700">
                    You have successfully registered as a consumer.
                  </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={() => (window.location.href = '/dashboard')}>Go to Dashboard</Button>
              </CardFooter>
            </Card>
          );
        }

        return (
          <Card>
            <CardHeader>
              <CardTitle>Register Producer Data</CardTitle>
              <CardDescription>
                Register additional producer information to create and share health records
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium">Your DID</p>
                <p className="text-xs font-mono break-all">{generateDid()}</p>
              </div>

              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="text-yellow-800">Producer Registration Required</AlertTitle>
                <AlertDescription className="text-yellow-700">
                  You need to register additional producer information to create and share health records.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-2">
                  <p className="text-sm font-medium">Status</p>
                  <Badge variant="outline" className="w-fit">
                    Active
                  </Badge>
                </div>
                <div className="flex flex-col space-y-2">
                  <p className="text-sm font-medium">Consent</p>
                  <Badge variant="outline" className="w-fit">
                    Pending
                  </Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleRegisterProducer} disabled={isProcessing || isBlockchainLoading}>
                {isProcessing || isBlockchainLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    Register Producer
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        );

      case RegistrationStep.COMPLETE:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Registration Complete</CardTitle>
              <CardDescription>You have successfully registered as a {userType}</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Registration Complete</AlertTitle>
                <AlertDescription className="text-green-700">
                  You have successfully registered as a {userType}.
                  {userType === 'producer' && ' You can now create and share health records.'}
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={() => (window.location.href = '/dashboard')}>Go to Dashboard</Button>
            </CardFooter>
          </Card>
        );

      default:
        return null;
    }
  };

  // Display error if any
  const displayError =
    contextError ||
    blockchainError ||
    didRegistrationState.error ||
    roleGrantState.error ||
    producerRegistrationState.error ||
    authenticationState.error;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{getStepTitle()}</h2>
          <Badge variant={userType === 'producer' ? 'default' : 'secondary'}>
            {userType.charAt(0).toUpperCase() + userType.slice(1)}
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {displayError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{displayError}</AlertDescription>
        </Alert>
      )}

      {renderStepContent()}
    </div>
  );
}
