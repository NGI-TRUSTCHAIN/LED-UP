'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/contexts/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAccount, useDisconnect } from 'wagmi';
import { toast } from 'sonner';
import { useAddressToDID, useRegisterDid } from '@/features/did-registry/hooks/use-did-registry';
import { generateKeyPair } from '@/features/cryptography';
import { AuthStatusCard } from '@/features/auth/components/auth-status-card';
import { DidCreationFlow } from '@/features/auth/components/did-creation-flow';
import { SigninFlowProvider, useSigninFlow } from '@/features/auth/contexts/signin-flow-context';
import { motion } from 'framer-motion';
import { useGrantDidRole } from '@/features/auth';
import { Role } from '@/features/did-auth/actions/mutation';

function SigninPageContent() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { isAuthenticated, isLoading, did: authDid, error, login, logout } = useAuth();
  const { data: existingDid, isLoading: isLoadingDid, refetch: refetchDid } = useAddressToDID(address);
  const registerDid = useRegisterDid();
  const { mutate: grantDidRole } = useGrantDidRole();

  const {
    isProcessing,
    privateKey,
    publicKey,
    didDocument,
    didIdentifier,
    didCreated,
    showDidCreationForm,
    // producerError,
    // producerTransactionHash,
    // producerIsSuccess,
    // status,
    // consent,
    setPrivateKey,
    setPublicKey,
    setDidDocument,
    setDidIdentifier,
    setDidCreated,
    setShowDidCreationForm,
    // setProducerError,
    // setProducerTransactionHash,
    // setProducerIsSuccess,
    setIsProcessing,
    resetSigninFlow,
  } = useSigninFlow();

  // Initialize DID document when address changes
  useEffect(() => {
    if (address && !existingDid && !didDocument) {
      const identifier = `did:ethr:${address}`;
      setDidIdentifier(identifier);

      // Generate a default DID document
      const defaultDocument = {
        '@context': 'https://www.w3.org/ns/did/v1',
        id: identifier,
        verificationMethod: [],
        authentication: [],
        assertionMethod: [],
      };

      setDidDocument(JSON.stringify(defaultDocument, null, 2));
    }
  }, [address, existingDid, didDocument, setDidIdentifier, setDidDocument]);

  // Handle DID creation and authentication flow
  const handleDidFlow = useCallback(async () => {
    if (!isConnected || !address || isProcessing || isAuthenticated) return;

    setIsProcessing(true);

    try {
      // Refetch to make sure we have the latest data
      await refetchDid();

      if (existingDid) {
        const success = await login(true, '/dashboard');

        if (success) {
          toast.success('Authentication Successful', {
            description: 'You are now securely logged in with your DID.',
          });

          // Redirect to dashboard
          router.push('/dashboard');
        }
      } else {
        // Generate key pair
        const { privateKey: newPrivateKey, publicKey: newPublicKey } = generateKeyPair();
        setPrivateKey(newPrivateKey);
        setPublicKey(newPublicKey);

        // Form DID identifier
        const identifier = `did:ethr:${address}`;
        setDidIdentifier(identifier);

        // Create initial DID document with the public key
        const initialDocument = {
          '@context': 'https://www.w3.org/ns/did/v1',
          id: identifier,
          verificationMethod: [
            {
              id: `${identifier}#keys-1`,
              type: 'EcdsaSecp256k1VerificationKey2019',
              controller: identifier,
              publicKeyHex: newPublicKey,
            },
          ],
          authentication: [`${identifier}#keys-1`],
          assertionMethod: [`${identifier}#keys-1`],
        };

        setDidDocument(JSON.stringify(initialDocument, null, 2));
        setShowDidCreationForm(true);
      }
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'An error occurred during DID processing',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [
    address,
    isConnected,
    existingDid,
    isProcessing,
    isAuthenticated,
    login,
    router,
    refetchDid,
    setPrivateKey,
    setPublicKey,
    setDidIdentifier,
    setDidDocument,
    setShowDidCreationForm,
    setIsProcessing,
  ]);

  // Trigger DID flow when wallet is connected
  useEffect(() => {
    if (
      isConnected &&
      address &&
      !isLoadingDid &&
      !isProcessing &&
      !isAuthenticated &&
      !didCreated &&
      !showDidCreationForm
    ) {
      handleDidFlow();
    }
  }, [
    isConnected,
    address,
    isLoadingDid,
    isProcessing,
    isAuthenticated,
    didCreated,
    showDidCreationForm,
    handleDidFlow,
  ]);

  // Handle wallet disconnect
  const handleDisconnect = async () => {
    if (isAuthenticated) {
      await logout();
    }
    disconnect();
    resetSigninFlow();
  };

  // Handle DID document update
  const handleDidDocumentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDidDocument(e.target.value);
  };

  // Handle DID registration
  const handleRegisterDid = async () => {
    setIsProcessing(true);

    try {
      // Register DID using the hook
      await registerDid.mutateAsync({
        did: didIdentifier,
        document: didDocument,
        publicKey: publicKey,
      });

      setDidCreated(true);

      toast.success('DID Created Successfully', {
        description: 'Your decentralized identity has been registered on the blockchain.',
      });
    } catch (error) {
      toast.error('Registration Error', {
        description: error instanceof Error ? error.message : 'An error occurred during DID registration',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGrantDidRole = async (role: Role) => {
    try {
      await grantDidRole({ did: didIdentifier, role });
      return true;
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'An error occurred during DID role grant',
      });
    }
  };

  // Handle producer registration
  const handleRegisterParticipant = async (role: Role) => {
    setIsProcessing(true);

    try {
      if (role === 'consumer' || role === 'admin' || role === 'provider') {
        const didGranted = await handleGrantDidRole(role);
        if (!didGranted) return;
      }

      const success = await login(true, '/dashboard');

      if (success) {
        toast.success('Producer Registration Successful', {
          description: 'You are now registered as a producer and securely logged in.',
        });
        router.push('/dashboard');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error('Authentication Failed', {
        description: errorMessage,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-muted/5 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 container max-w-5xl mx-auto px-4 min-h-screen flex items-center justify-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          {!showDidCreationForm ? (
            <Card className="w-full max-w-md mx-auto shadow-2xl bg-card/95 backdrop-blur-sm">
              <CardHeader className="text-center space-y-4 pb-8">
                <motion.div
                  initial={{ scale: 0.98 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 blur-xl rounded-full" />
                  <CardTitle className="relative text-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                    SignIn to LED-UP
                  </CardTitle>
                </motion.div>
                <CardDescription className="text-base text-muted-foreground/90 leading-relaxed max-w-sm mx-auto">
                  Connect your wallet to automatically authenticate with your decentralized identity
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-8">
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.2 }}
                >
                  <AuthStatusCard
                    isConnected={isConnected}
                    address={address}
                    isAuthenticated={isAuthenticated}
                    authDid={authDid}
                    existingDid={existingDid}
                    isLoading={isLoading}
                    isLoadingDid={isLoadingDid}
                    isProcessing={isProcessing}
                    didCreated={didCreated}
                    onDisconnect={handleDisconnect}
                  />
                </motion.div>
              </CardContent>
            </Card>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <DidCreationFlow
                didIdentifier={didIdentifier}
                publicKey={publicKey}
                privateKey={privateKey}
                didDocument={didDocument}
                isProcessing={isProcessing}
                onDidDocumentChange={handleDidDocumentChange}
                onCancel={handleDisconnect}
                onDidRegister={handleRegisterDid}
                onParticipantRegister={handleRegisterParticipant}
              />
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function SigninPage() {
  return (
    <SigninFlowProvider>
      <SigninPageContent />
    </SigninFlowProvider>
  );
}
