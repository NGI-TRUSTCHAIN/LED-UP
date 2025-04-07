'use client';

import { useRegistration, RegistrationStep } from '../contexts/registration-provider';
import { CheckCircle2, CircleDashed, Wallet, Key, UserCircle, Database } from 'lucide-react';

interface RegistrationStepsProps {
  userType: 'consumer' | 'producer';
}

export function RegistrationSteps({ userType }: RegistrationStepsProps) {
  const { currentStep } = useRegistration();

  // Define steps based on user type
  const steps = [
    {
      id: RegistrationStep.CONNECT_WALLET,
      name: 'Connect Wallet',
      description: 'Connect your Ethereum wallet',
      icon: Wallet,
    },
    {
      id: RegistrationStep.REGISTER_DID,
      name: 'Register DID',
      description: 'Register a new decentralized identity',
      icon: Key,
    },
    {
      id: RegistrationStep.AUTHENTICATE_DID,
      name: 'Authenticate DID',
      description: 'Authenticate with your decentralized identifier',
      icon: Key,
    },
    {
      id: RegistrationStep.REGISTER_ROLE,
      name: `Register as ${userType === 'consumer' ? 'Consumer' : 'Producer'}`,
      description: `Register your DID as a ${userType === 'consumer' ? 'consumer' : 'producer'}`,
      icon: UserCircle,
    },
    ...(userType === 'producer'
      ? [
          {
            id: RegistrationStep.REGISTER_PRODUCER,
            name: 'Register Producer Data',
            description: 'Register additional producer information',
            icon: Database,
          },
        ]
      : []),
    {
      id: userType === 'producer' ? RegistrationStep.COMPLETE : RegistrationStep.REGISTER_PRODUCER,
      name: 'Complete',
      description: 'Registration complete',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="absolute left-9 top-4 h-full w-0.5 bg-muted-foreground/20" />
        <div className="space-y-6">
          {steps.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <div key={step.id} className="flex items-start gap-2">
                <div
                  className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
                    isActive
                      ? 'border-primary bg-primary text-primary-foreground'
                      : isCompleted
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted-foreground/20 bg-background'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : isActive ? (
                    <step.icon className="h-5 w-5" />
                  ) : (
                    <CircleDashed className="h-5 w-5 text-muted-foreground/50" />
                  )}
                </div>
                <div className="ml-4 pb-8">
                  <div className="mb-1 text-base font-medium">{step.name}</div>
                  <div className="text-sm text-muted-foreground">{step.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
