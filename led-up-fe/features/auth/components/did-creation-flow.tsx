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
import { Sparkles, ShieldCheck } from 'lucide-react';
import { Role } from '@/features/did-auth/actions/mutation';

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
  onParticipantRegister: (role: Role) => void;
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
  onParticipantRegister,
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
      const success = await login(true, '/dashboard');
      if (success) {
        toast.success('Authentication Successful', {
          description: 'You are now securely logged in with your DID.',
        });
        router.push('/dashboard');
      }
    } else {
      setActiveStep(2);
    }
  };

  // Handle producer registration
  const handleRegisterParticipant = async (e: React.FormEvent) => {
    if (selectedRole === 'consumer') {
      // producer role will be registered with did registration step
      onParticipantRegister(selectedRole);
    }
  };

  useEffect(() => {
    if (didCreated && activeStep === 1) {
      const timer = setTimeout(() => {
        setShowRoleDialog(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [didCreated, activeStep]);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard', {
      description: `${type} has been copied to clipboard`,
    });
  };

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
            onRegister={handleRegisterParticipant}
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
    <Card className="w-full max-w-3xl mx-auto shadow-2xl border bg-card/95 overflow-hidden relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/5 before:via-background before:to-secondary/5 before:opacity-60 before:rounded-xl isolate">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative z-10"
      >
        <CardHeader className="text-center space-y-5 py-8 px-8 relative">
          {/* Decorative elements */}
          <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-70" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/10 rounded-full blur-3xl opacity-70" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-24 bg-gradient-to-r from-transparent via-primary/5 to-transparent rotate-12 opacity-40" />
          </div>

          <div className="relative">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="inline-flex items-center justify-center p-3.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary mb-5 ring-1 ring-primary/20"
            >
              <ShieldCheck className="h-6 w-6 stroke-[1.5px]" />
            </motion.div>
            <CardTitle className="text-3xl font-bold tracking-tight bg-gradient-to-br from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent pb-1">
              Create Your Decentralized Identity
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground/90 mt-3 max-w-lg mx-auto font-normal">
              Follow these steps to create your DID and join the LED-UP ecosystem securely
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 px-8 pb-10">
          {/* Step Indicator */}
          <div className="relative px-2">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="relative z-10"
            >
              <StepIndicator steps={registrationSteps} activeStep={activeStep} onStepChange={handleStepChange} />
            </motion.div>
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-muted/40 via-border to-muted/40 -translate-y-1/2" />
          </div>

          {/* Step Content */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-card/80 to-card/70 backdrop-blur-sm rounded-xl opacity-90" />
            <div className="relative p-6 rounded-xl border border-border/40 shadow-lg overflow-hidden">
              <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-primary/5 rounded-full blur-2xl opacity-60" />
                <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-secondary/5 rounded-full blur-2xl opacity-60" />
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="relative z-10"
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
