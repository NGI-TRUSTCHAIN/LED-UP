'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StepIndicator, type Step } from '@/components/ui/step-indicator';
import { DidDocumentForm } from './did-document-form';
import { PrivateKeyDialog } from './private-key-dialog';
import { toast } from 'sonner';
import LedUpParticipation from './led-up-particpation';
import { UserRoleDialog } from './user-role-dialog';
import { useSigninFlow } from '../contexts/signin-flow-context';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/contexts/auth-provider';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

// Define the registration steps - consolidated to 3 steps
const registrationSteps: Step[] = [
  {
    id: '1',
    label: 'Connect Wallet',
    description: 'Connect your wallet to get started',
  },
  {
    id: '2',
    label: 'Configure & Register DID',
    description: 'Review, secure, and register your DID',
  },
  {
    id: '3',
    label: 'LedUp Participation',
    description: 'Choose your participation in LedUp',
  },
];

interface DidCreationFlowProps {
  didIdentifier: string;
  publicKey: string;
  privateKey: string;
  didDocument: string;
  isProcessing: boolean;
  onDidDocumentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onCancel: () => void;
  onDidRegister: () => void;
  onProducerRegister: (e: React.FormEvent) => void;
}

export function DidCreationFlow({
  didIdentifier,
  publicKey,
  privateKey,
  didDocument,
  isProcessing,
  onDidDocumentChange,
  onCancel,
  onDidRegister,
  onProducerRegister,
}: DidCreationFlowProps) {
  const router = useRouter();
  const { login } = useAuth();
  const [activeStep, setActiveStep] = useState(1); // Start at step 1 (Configure & Register DID)
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [keySaved, setKeySaved] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'consumer' | 'producer' | null>(null);
  const { didCreated } = useSigninFlow();

  // Handle step navigation
  const handleStepChange = (step: number) => {
    // Only allow navigation to steps that are accessible
    // This prevents skipping steps
    if (step <= activeStep || step === activeStep + 1) {
      setActiveStep(step);
    } else {
      toast.error('Cannot Skip Steps', {
        description: 'Please complete the current step first',
      });
    }
  };

  // Move to next step
  const handleNextStep = () => {
    if (activeStep === 1 && !keySaved) {
      // Show private key dialog before proceeding
      setShowKeyDialog(true);
      return;
    }

    if (activeStep === 1 && !didCreated) {
      // Register DID before proceeding
      handleDidRegister();
      return;
    }

    if (activeStep === 1 && didCreated) {
      setShowRoleDialog(true);
      return;
    }

    setActiveStep((prev) => prev + 1);
  };

  // Handle DID registration
  const handleDidRegister = async () => {
    if (!keySaved) {
      toast.error('Save Your Private Key', {
        description: 'Please save your private key before registering your DID',
      });
      setShowKeyDialog(true);
      return;
    }

    // Call the provided onDidRegister function
    await onDidRegister();
  };

  // Move to previous step
  const handlePrevStep = () => {
    setActiveStep((prev) => Math.max(0, prev - 1));
  };

  // Handle key dialog close
  const handleKeyDialogClose = () => {
    setShowKeyDialog(false);
    setKeySaved(true);
    toast.success('Private Key Saved', {
      description: 'Your private key has been saved. You can now register your DID.',
    });
  };

  // Handle role selection
  const handleRoleSelect = async (role: string) => {
    const typedRole = role as 'consumer' | 'producer';
    setSelectedRole(typedRole);
    setShowRoleDialog(false);

    if (typedRole === 'consumer') {
      // For consumers, authenticate and redirect to dashboard
      const success = await login(true, '/dashboard');
      if (success) {
        toast.success('Authentication Successful', {
          description: 'You are now securely logged in with your DID.',
        });
        router.push('/dashboard');
      }
    } else {
      // For producers, show the registration form
      setActiveStep(2);
    }
  };

  // Handle producer registration
  const handleProducerRegister = async (e: React.FormEvent) => {
    // Call the parent's onProducerRegister function to handle the actual registration
    onProducerRegister(e);

    // After successful producer registration, authenticate and redirect
    // This will be handled by the parent component
  };

  // Effect to move to next step after DID is created
  useEffect(() => {
    if (didCreated && activeStep === 1) {
      // Small delay to allow the user to see the success message
      const timer = setTimeout(() => {
        setShowRoleDialog(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [didCreated, activeStep]);

  // Copy to clipboard
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard', {
      description: `${type} has been copied to clipboard`,
    });
  };

  // Render the appropriate step content
  const renderStepContent = () => {
    switch (activeStep) {
      case 1: // Configure & Register DID (consolidated step)
        return (
          <DidDocumentForm
            didIdentifier={didIdentifier}
            publicKey={publicKey}
            didDocument={didDocument}
            onDidDocumentChange={onDidDocumentChange}
            onCopyPublicKey={() => copyToClipboard(publicKey, 'Public key')}
            onCancel={onCancel}
            onNext={handleNextStep}
            onRegister={handleDidRegister}
            isProcessing={isProcessing}
            keySaved={keySaved}
            didCreated={didCreated}
          />
        );

      case 2: // LedUp Participation (only shown for producers)
        return selectedRole === 'producer' ? (
          <LedUpParticipation
            onPrevious={handlePrevStep}
            onNext={handleNextStep}
            onRegister={handleProducerRegister}
            isProcessing={isProcessing}
            showRoleDialog={showRoleDialog}
            setShowRoleDialog={setShowRoleDialog}
          />
        ) : null;

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-2xl border bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-sm overflow-hidden">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        <CardHeader className="text-center space-y-6 pb-8 relative">
          {/* Decorative background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary/5 rounded-full blur-3xl" />
          </div>

          <div className="relative">
            <motion.div
              initial={{ scale: 0.98 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
              className="inline-flex items-center justify-center p-3 rounded-xl bg-primary/10 text-primary mb-4"
            >
              <Sparkles className="h-6 w-6" />
            </motion.div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              Create Your Decentralized Identity
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground/90 mt-2 max-w-lg mx-auto">
              Follow these steps to create your DID and join the LED-UP ecosystem
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 px-8 pb-8">
          {/* Step Indicator */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="relative z-10"
            >
              <StepIndicator steps={registrationSteps} activeStep={activeStep} onStepChange={handleStepChange} />
            </motion.div>
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-muted via-border to-muted -translate-y-1/2" />
          </div>

          {/* Step Content */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm rounded-xl" />
            <div className="relative p-6 rounded-xl border border-border/50 shadow-lg">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderStepContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </CardContent>
      </motion.div>

      {/* Dialogs */}
      <PrivateKeyDialog
        open={showKeyDialog}
        privateKey={privateKey}
        onOpenChange={setShowKeyDialog}
        onCopyPrivateKey={() => copyToClipboard(privateKey, 'Private key')}
        onConfirm={handleKeyDialogClose}
      />

      <UserRoleDialog open={showRoleDialog} onOpenChange={setShowRoleDialog} onSelectRole={handleRoleSelect} />
    </Card>
  );
}
