'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2, FileText, XIcon, PlusCircle } from 'lucide-react';
import { useSonner } from '@/hooks/use-sonner';
import { useRegisterRecord } from '@/features/data-registry/hooks/use-data-registry';
import { ConsentStatus, RecordMetadata, ResourceMetadata } from '@/features/data-registry/types';
import { v4 as uuidv4 } from 'uuid';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Import all FHIR resource forms
import { PatientForm } from '@/features/data-registry/components/forms/patient';
import { ProcedureForm } from '@/features/data-registry/components/forms/procedure';
import { ObservationForm } from '@/features/data-registry/components/forms/observation';
import { MedicationForm } from '@/features/data-registry/components/forms/medication';
import { ConditionForm } from '@/features/data-registry/components/forms/condition';
import { AllergyIntoleranceForm } from '@/features/data-registry/components/forms/allergy-intolerance';
import { ImmunizationForm } from '@/features/data-registry/components/forms/immunization';
import { DiagnosticReportForm } from '@/features/data-registry/components/forms/diagnostic-report';
import { EncounterForm } from '@/features/data-registry/components/forms/encounter';
import { CarePlanForm } from '@/features/data-registry/components/forms/care-plan';
import { MedicationRequestForm } from '@/features/data-registry/components/forms/medication-request';
import { MedicationStatementForm } from '@/features/data-registry/components/forms/medication-statement';
import { FamilyHistoryForm } from '@/features/data-registry/components/forms/family-history';
import { SocialHistoryForm } from '@/features/data-registry/components/forms/social-history';
import { AdverseEventForm } from '@/features/data-registry/components/forms/adverse-event';
import { AppointmentForm } from '@/features/data-registry/components/forms/appointment';
import { OrganizationForm } from '@/features/data-registry/components/forms/organization';
import { PractitionerForm } from '@/features/data-registry/components/forms/practitioner';
import { RelatedPersonForm } from '@/features/data-registry/components/forms/related-person';
import { LocationForm } from '@/features/data-registry/components/forms/location';
import { useAuth } from '@/features/auth/contexts/auth-provider';
import { getResourceTypeEnum } from '@/features/data-registry/utils';

// Define the resource types
const resourceTypes = [
  { id: 'Patient', label: 'Patient' },
  { id: 'Procedure', label: 'Procedure' },
  { id: 'Observation', label: 'Observation' },
  { id: 'Medication', label: 'Medication' },
  { id: 'Condition', label: 'Condition' },
  { id: 'AllergyIntolerance', label: 'Allergy Intolerance' },
  { id: 'Immunization', label: 'Immunization' },
  { id: 'DiagnosticReport', label: 'Diagnostic Report' },
  { id: 'Encounter', label: 'Encounter' },
  { id: 'CarePlan', label: 'Care Plan' },
  { id: 'MedicationRequest', label: 'Medication Request' },
  { id: 'MedicationStatement', label: 'Medication Statement' },
  { id: 'FamilyHistory', label: 'Family History' },
  { id: 'SocialHistory', label: 'Social History' },
  { id: 'AdverseEvent', label: 'Adverse Event' },
  { id: 'Appointment', label: 'Appointment' },
  { id: 'Organization', label: 'Organization' },
  { id: 'Practitioner', label: 'Practitioner' },
  { id: 'RelatedPerson', label: 'Related Person' },
  { id: 'Location', label: 'Location' },
];

// Group resource types by category for better organization in dropdown
const resourceCategories = [
  {
    name: 'Patient Records',
    items: ['Patient', 'Encounter', 'Condition', 'Observation', 'DiagnosticReport'],
  },
  {
    name: 'Medications',
    items: ['Medication', 'MedicationRequest', 'MedicationStatement'],
  },
  {
    name: 'Care & Planning',
    items: ['CarePlan', 'Procedure', 'Immunization', 'Appointment'],
  },
  {
    name: 'History & Allergies',
    items: ['AllergyIntolerance', 'FamilyHistory', 'SocialHistory', 'AdverseEvent'],
  },
  {
    name: 'Healthcare Providers',
    items: ['Practitioner', 'Organization', 'RelatedPerson', 'Location'],
  },
];

// Registration status enum
enum RegistrationStatus {
  IDLE,
  PREPARING,
  REGISTERING,
  SUCCESS,
  ERROR,
}

const Page = () => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { did: userDid } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useSonner();
  const { mutateAsync: registerProducerRecord, isPending: isRegistering } = useRegisterRecord();

  const [selectedResourceType, setSelectedResourceType] = useState<string>('');
  const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatus>(RegistrationStatus.IDLE);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [recordId, setRecordId] = useState<string>('');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Check for resource type in URL parameters on component mount
  useEffect(() => {
    if (!searchParams) return;
    const typeParam = searchParams.get('type');
    if (typeParam && resourceTypes.some((resource) => resource.id === typeParam)) {
      setSelectedResourceType(typeParam);
      setIsDrawerOpen(true);
    }
  }, [searchParams]);

  const handleResourceTypeChange = (value: string) => {
    setSelectedResourceType(value);
    setIsDrawerOpen(true);
  };

  // Generate a signature for the record
  // const generateSignature = async (data: any): Promise<string> => {
  //   try {
  //     if (!walletClient || !address) {
  //       throw new Error('Wallet not connected');
  //     }

  //     // Create a message to sign
  //     const message = JSON.stringify({
  //       data: data,
  //       timestamp: Date.now(),
  //       resourceType: selectedResourceType,
  //     });

  //     // Hash the message
  //     const messageHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(message));

  //     // Convert hash to hex string
  //     const hashArray = Array.from(new Uint8Array(messageHash));
  //     const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  //     // Sign the hash with the wallet
  //     const signature = await walletClient.signMessage({
  //       account: address as `0x${string}`,
  //       message: { raw: `0x${hashHex}` as `0x${string}` },
  //     });

  //     return signature;
  //   } catch (error) {
  //     console.error('Error generating signature:', error);
  //     // Return a placeholder signature if signing fails
  //     return '0x0000000000000000000000000000000000000000000000000000000000000000';
  //   }
  // };

  // Create metadata for the record
  // const createMetadata = (data: any): RecordMetadata => {
  //   // In a real implementation, this would include IPFS CID, URL, and hash
  //   // For now, we'll use placeholder values
  //   return {
  //     cid: `ipfs://${uuidv4()}`,
  //     url: `https://example.com/${uuidv4()}`,
  //     contentHash: `0x${Array(64)
  //       .fill(0)
  //       .map(() => Math.floor(Math.random() * 16).toString(16))
  //       .join('')}`,
  //     dataSize: 0,
  //     resourceType: getResourceTypeEnum(selectedResourceType),
  //   };
  // };

  const handleFormSubmit = async (data: any) => {
    if (!address || !walletClient) {
      toast.error('Wallet not connected', {
        description: 'Please connect your wallet to register a record.',
      });
      return;
    }

    try {
      // Reset state
      setRegistrationStatus(RegistrationStatus.PREPARING);
      setErrorMessage('');

      // Get the actual DID from the auth hook
      const ownerDid = userDid;

      if (!ownerDid) {
        throw new Error('Owner DID not found');
      }

      // Generate a unique record ID
      const newRecordId = `record-${uuidv4()}`;
      setRecordId(newRecordId);

      // // Generate signature
      // const signature = await generateSignature(data);

      // // Create metadata
      // const metadata = createMetadata(data);

      // Prepare registration parameters
      const registrationParams: ResourceMetadata = {
        recordId: newRecordId,
        producer: address,
        resourceType: getResourceTypeEnum(selectedResourceType),
        sharedCount: 0,
        dataSize: 0,
        contentHash: `0x${Array(64)
          .fill(0)
          .map(() => Math.floor(Math.random() * 16).toString(16))
          .join('')}`,
        cid: `ipfs://${uuidv4()}`,
      };

      // Update status
      setRegistrationStatus(RegistrationStatus.REGISTERING);

      try {
        // Register the record on the blockchain
        const result = await registerProducerRecord(registrationParams);

        console.log('Registration result:', result);

        // Handle success
        setRegistrationStatus(RegistrationStatus.SUCCESS);

        toast.success('Record registered successfully', {
          description: `Your ${selectedResourceType} record has been registered on the blockchain.`,
        });

        // Close the drawer
        setIsDrawerOpen(false);

        // After 3 seconds, redirect to the dashboard
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      } catch (registerError) {
        console.error('Error registering record on blockchain:', registerError);
        setRegistrationStatus(RegistrationStatus.ERROR);

        // Extract the specific error message
        let errorMsg = 'Failed to register record on the blockchain';

        if (registerError instanceof Error) {
          // Check for specific error types
          if (registerError.message.includes('Producer is already registered')) {
            errorMsg = 'This producer is already registered. Please try a different account.';
          } else if (registerError.message.includes('RecordAlreadyExists')) {
            errorMsg = 'This record already exists. Please try again with a different record.';
          } else if (registerError.message.includes('Unauthorized')) {
            errorMsg = 'You are not authorized to register this record. Please check your DID and permissions.';
          } else {
            errorMsg = registerError.message;
          }
        }

        setErrorMessage(errorMsg);

        toast.error('Registration failed', {
          description: errorMsg,
        });
      }
    } catch (error) {
      console.error('Error preparing record for registration:', error);
      setRegistrationStatus(RegistrationStatus.ERROR);
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');

      toast.error('Registration failed', {
        description:
          error instanceof Error
            ? `Failed to prepare record: ${error.message}`
            : 'An unknown error occurred during record preparation',
      });
    }
  };

  // Render the appropriate form based on the selected resource type
  const renderForm = () => {
    switch (selectedResourceType) {
      case 'Patient':
        return <PatientForm onSubmit={handleFormSubmit} />;
      case 'Procedure':
        return <ProcedureForm onSubmit={handleFormSubmit} patientReference={userDid} />;
      case 'Observation':
        return <ObservationForm onSubmit={handleFormSubmit} patientReference={userDid} />;
      case 'Medication':
        return <MedicationForm onSubmit={handleFormSubmit} />;
      case 'Condition':
        return <ConditionForm onSubmit={handleFormSubmit} patientReference={userDid} />;
      case 'AllergyIntolerance':
        return <AllergyIntoleranceForm onSubmit={handleFormSubmit} patientReference={userDid} />;
      case 'Immunization':
        return <ImmunizationForm onSubmit={handleFormSubmit} patientReference={userDid} />;
      case 'DiagnosticReport':
        return <DiagnosticReportForm onSubmit={handleFormSubmit} patientReference={userDid} />;
      case 'Encounter':
        return <EncounterForm onSubmit={handleFormSubmit} patientReference={userDid} />;
      case 'CarePlan':
        return <CarePlanForm onSubmit={handleFormSubmit} patientReference={userDid} />;
      case 'MedicationRequest':
        return <MedicationRequestForm onSubmit={handleFormSubmit} patientReference={userDid} />;
      case 'MedicationStatement':
        return <MedicationStatementForm onSubmit={handleFormSubmit} patientReference={userDid} />;
      case 'FamilyHistory':
        return <FamilyHistoryForm onSubmit={handleFormSubmit} patientReference={userDid} />;
      case 'SocialHistory':
        return <SocialHistoryForm onSubmit={handleFormSubmit} patientReference={userDid} />;
      case 'AdverseEvent':
        return <AdverseEventForm onSubmit={handleFormSubmit} patientReference={userDid} />;
      case 'Appointment':
        return <AppointmentForm onSubmit={handleFormSubmit} patientReference={userDid} />;
      case 'Organization':
        return <OrganizationForm onSubmit={handleFormSubmit} />;
      case 'Practitioner':
        return <PractitionerForm onSubmit={handleFormSubmit} />;
      case 'RelatedPerson':
        return <RelatedPersonForm onSubmit={handleFormSubmit} patientReference={userDid} />;
      case 'Location':
        return <LocationForm onSubmit={handleFormSubmit} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <p className="text-lg text-gray-500">Please select a resource type to continue</p>
          </div>
        );
    }
  };

  // Render the status message
  const renderStatusMessage = () => {
    switch (registrationStatus) {
      case RegistrationStatus.PREPARING:
        return (
          <Alert className="mb-4 bg-primary/20 dark:bg-primary/20 text-primary border-primary/40 dark:border-primary/50">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>Preparing record</AlertTitle>
            <AlertDescription>Your health record is being prepared for registration.</AlertDescription>
          </Alert>
        );
      case RegistrationStatus.REGISTERING:
        return (
          <Alert className="mb-4 bg-primary/20 dark:bg-primary/20 text-primary border-primary/40 dark:border-primary/50">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>Registering on blockchain</AlertTitle>
            <AlertDescription>
              Your record is being registered on the blockchain. This may take a moment.
            </AlertDescription>
          </Alert>
        );
      case RegistrationStatus.SUCCESS:
        return (
          <Alert className="mb-4 bg-green-50 dark:bg-green-900 text-green-500 dark:text-green-400 border-green-400 dark:border-green-600">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertTitle>Registration successful</AlertTitle>
            <AlertDescription>Your record has been successfully registered. Record ID: {recordId}</AlertDescription>
          </Alert>
        );
      case RegistrationStatus.ERROR:
        return (
          <Alert className="mb-4 bg-red-50 dark:bg-red-900 text-red-500 dark:text-red-400 border-red-400 dark:border-red-600">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Registration failed</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        );
      default:
        return null;
    }
  };

  // Get the title for the drawer based on the selected resource type
  const getDrawerTitle = () => {
    const selectedResource = resourceTypes.find((type) => type.id === selectedResourceType);
    return selectedResource ? `Register ${selectedResource.label}` : 'Register Health Record';
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Register Health Record</CardTitle>
          <CardDescription>Register a new health record on the blockchain</CardDescription>
        </CardHeader>
        <CardContent>
          {renderStatusMessage()}

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Select Resource Type</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {selectedResourceType
                    ? resourceTypes.find((r) => r.id === selectedResourceType)?.label
                    : 'Select a resource type'}
                  <PlusCircle className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                {resourceCategories.map((category) => (
                  <React.Fragment key={category.name}>
                    <DropdownMenuLabel>{category.name}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      {category.items.map((itemId) => {
                        const resource = resourceTypes.find((r) => r.id === itemId);
                        return resource ? (
                          <DropdownMenuItem key={resource.id} onClick={() => handleResourceTypeChange(resource.id)}>
                            {resource.label}
                          </DropdownMenuItem>
                        ) : null;
                      })}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                  </React.Fragment>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-6 flex justify-center">
            {selectedResourceType && (
              <Button onClick={() => setIsDrawerOpen(true)} className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Open {selectedResourceType} Form
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Form Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} direction="right">
        <DrawerContent className="overflow-x-hidden rounded-none mt-0 h-screen overflow-y-auto sm:max-h-screen sm:inset-y-0 sm:right-0 sm:left-auto sm:rounded-none sm:rounded-l-[10px] sm:w-[400px] md:w-[500px] lg:w-[560px] xl:w-[640px] 2xl:w-[760px]">
          <DrawerHeader>
            <DrawerTitle>{getDrawerTitle()}</DrawerTitle>
            <DrawerDescription>
              Fill out the form below to register a new {selectedResourceType} record.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 py-2">{renderForm()}</div>

          <DrawerClose asChild className="absolute right-4 top-4">
            <Button variant="outline">
              <XIcon className="h-6 w-6" />
            </Button>
          </DrawerClose>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default Page;
