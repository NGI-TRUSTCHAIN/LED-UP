'use client';
import { useEffect, useState } from 'react';
import {
  X,
  PlusCircle,
  User,
  Stethoscope,
  Activity,
  Pill,
  HeartPulse,
  AlertTriangle,
  Syringe,
  FileText,
  CalendarDays,
  ClipboardList,
  Tablets,
  Users,
  History,
  AlertOctagon,
  Calendar,
  Building,
  UserRound,
  UserPlus,
  MapPin,
  ScrollText,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

import { useAuth } from '@/features/auth/contexts/auth-provider';
import { toast } from 'sonner';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
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
import { useCreateRecordWithIPFS } from '@/features/data-registry/hooks/use-ipfs-mutations';
import { v4 as uuidv4 } from 'uuid';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useWalletClient } from 'wagmi';
import { useSignData } from '@/lib/signature';
import { hashData } from '@/lib/hash';

// Define resource types with icons
const resourceTypes = [
  { id: 'Patient', label: 'Patient', icon: <User className="h-4 w-4 mr-2" /> },
  { id: 'Procedure', label: 'Procedure', icon: <Stethoscope className="h-4 w-4 mr-2" /> },
  { id: 'Observation', label: 'Observation', icon: <Activity className="h-4 w-4 mr-2" /> },
  { id: 'Medication', label: 'Medication', icon: <Pill className="h-4 w-4 mr-2" /> },
  { id: 'Condition', label: 'Condition', icon: <HeartPulse className="h-4 w-4 mr-2" /> },
  { id: 'AllergyIntolerance', label: 'Allergy Intolerance', icon: <AlertTriangle className="h-4 w-4 mr-2" /> },
  { id: 'Immunization', label: 'Immunization', icon: <Syringe className="h-4 w-4 mr-2" /> },
  { id: 'DiagnosticReport', label: 'Diagnostic Report', icon: <FileText className="h-4 w-4 mr-2" /> },
  { id: 'Encounter', label: 'Encounter', icon: <CalendarDays className="h-4 w-4 mr-2" /> },
  { id: 'CarePlan', label: 'Care Plan', icon: <ClipboardList className="h-4 w-4 mr-2" /> },
  { id: 'MedicationRequest', label: 'Medication Request', icon: <ScrollText className="h-4 w-4 mr-2" /> },
  { id: 'MedicationStatement', label: 'Medication Statement', icon: <Tablets className="h-4 w-4 mr-2" /> },
  { id: 'FamilyHistory', label: 'Family History', icon: <Users className="h-4 w-4 mr-2" /> },
  { id: 'SocialHistory', label: 'Social History', icon: <History className="h-4 w-4 mr-2" /> },
  { id: 'AdverseEvent', label: 'Adverse Event', icon: <AlertOctagon className="h-4 w-4 mr-2" /> },
  { id: 'Appointment', label: 'Appointment', icon: <Calendar className="h-4 w-4 mr-2" /> },
  { id: 'Organization', label: 'Organization', icon: <Building className="h-4 w-4 mr-2" /> },
  { id: 'Practitioner', label: 'Practitioner', icon: <UserRound className="h-4 w-4 mr-2" /> },
  { id: 'RelatedPerson', label: 'Related Person', icon: <UserPlus className="h-4 w-4 mr-2" /> },
  { id: 'Location', label: 'Location', icon: <MapPin className="h-4 w-4 mr-2" /> },
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

// Client-side component wrapper to prevent hydration issues
export function AddRecordDropdown() {
  const [mounted, setMounted] = useState(false);

  // Use useEffect to ensure we only render client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder while the component is not yet mounted
    return (
      <Button className="gap-2" disabled>
        <PlusCircle className="h-4 w-4" />
        Add Health Record
      </Button>
    );
  }

  // Once mounted, render the real component
  return <AddRecordDropdownContent />;
}

// The actual component content
function AddRecordDropdownContent() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedResourceType, setSelectedResourceType] = useState<string>('');
  const { did: userDid, address } = useAuth();
  const { mutateAsync: registerProducerRecord } = useCreateRecordWithIPFS();
  const { data: walletClient } = useWalletClient();
  const [registrationStatus, setRegistrationStatus] = useState<
    'idle' | 'preparing' | 'registering' | 'success' | 'error'
  >('idle');
  const signDataMutation = useSignData();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [recordId, setRecordId] = useState<string>('');

  const handleResourceSelect = (resourceType: string) => {
    // Reset states when selecting a new resource
    setRegistrationStatus('idle');
    setErrorMessage('');
    setRecordId('');
    setSelectedResourceType(resourceType);
    setIsDrawerOpen(true);
  };

  // Add drawer close handler
  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setRegistrationStatus('idle');
    setErrorMessage('');
    setRecordId('');
    setSelectedResourceType('');
  };

  const handleFormSubmit = async (data: any) => {
    if (!address || !walletClient) {
      toast.error('Wallet not connected. Please connect your wallet to register a record.');
      return;
    }

    try {
      // Reset state
      setRegistrationStatus('preparing');
      setErrorMessage('');

      // Get the actual DID from the auth hook
      const ownerDid = userDid;

      if (!ownerDid) {
        throw new Error('Owner DID not found');
      }

      // Generate a unique record ID
      let recordId = '';
      const tempId = data.id || uuidv4();

      // Use the form's resource type for ID construction
      const resourceTypeForId = data.resourceType || selectedResourceType;
      recordId = `${resourceTypeForId}-${tempId}`;

      if (!data.id) {
        data.id = tempId;
      }

      setRecordId(recordId);

      // Generate signature
      const contentHash = await hashData(
        JSON.stringify({
          data,
          timestamp: Date.now(),
          producer: address as string,
        })
      );

      const signature = await signDataMutation.mutateAsync(contentHash);

      // Add necessary properties to the data object
      const enhancedData = {
        resource: {
          ...data,
          resourceType: resourceTypeForId,
        },
        metadata: {
          recordId,
          name: recordId,
          resourceType: resourceTypeForId,
          contentHash,
          signature,
          timestamp: Date.now(),
        },
      };
      // Update status
      setRegistrationStatus('registering');

      try {
        // Register the record on the blockchain with IPFS integration
        const result = await registerProducerRecord({
          data: enhancedData,
          producer: address as string,
        });

        console.log('Registration result:', result);

        // Handle success
        setRegistrationStatus('success');

        toast.success(`Your ${selectedResourceType} record has been registered on the blockchain.`);

        // Close the drawer after 3 seconds
        setTimeout(() => {
          setIsDrawerOpen(false);
          setRegistrationStatus('idle');
        }, 3000);
      } catch (registerError) {
        console.error('Error registering record on blockchain:', registerError);
        setRegistrationStatus('error');

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
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('Error preparing record for registration:', error);
      setRegistrationStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
      toast.error(error instanceof Error ? error.message : 'An unknown error occurred during record preparation');
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

  // Get the title for the drawer based on the selected resource type
  const getDrawerTitle = () => {
    const selectedResource = resourceTypes.find((type) => type.id === selectedResourceType);
    return selectedResource ? `Register ${selectedResource.label}` : 'Register Health Record';
  };

  // Render the status message
  const renderStatusMessage = () => {
    switch (registrationStatus) {
      case 'preparing':
        return (
          <Alert className="mb-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>Preparing record</AlertTitle>
            <AlertDescription>Your health record is being prepared for registration.</AlertDescription>
          </Alert>
        );
      case 'registering':
        return (
          <Alert className="mb-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>Registering on blockchain</AlertTitle>
            <AlertDescription>
              Your record is being registered on the blockchain. This may take a moment.
            </AlertDescription>
          </Alert>
        );
      case 'success':
        return (
          <Alert className="mb-4 bg-green-50 dark:bg-green-900 dark:text-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-200" />
            <AlertTitle>Registration successful</AlertTitle>
            <AlertDescription>Your record has been successfully registered. Record ID: {recordId}</AlertDescription>
          </Alert>
        );
      case 'error':
        return (
          <Alert className="mb-4 bg-red-50 dark:bg-red-900 dark:text-red-200" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Registration failed</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button className="gap-2 dark:text-foreground">
            <PlusCircle className="h-4 w-4" />
            Add Health Record
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          {resourceCategories.map((category) => (
            <div key={category.name}>
              <DropdownMenuLabel>{category.name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {category.items.map((itemId) => {
                  const resource = resourceTypes.find((r) => r.id === itemId);
                  return resource ? (
                    <DropdownMenuItem
                      key={resource.id}
                      onClick={() => handleResourceSelect(resource.id)}
                      className="flex items-center"
                    >
                      {resource.icon}
                      {resource.label}
                    </DropdownMenuItem>
                  ) : null;
                })}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Form Drawer */}

      {isDrawerOpen && selectedResourceType && (
        <Drawer
          open={isDrawerOpen}
          onOpenChange={(open) => {
            if (!open) {
              handleDrawerClose();
            }
          }}
          direction="right"
        >
          <DrawerContent className="overflow-x-hidden rounded-none mt-0 h-screen overflow-y-auto sm:max-h-screen sm:inset-y-0 sm:right-0 sm:left-auto sm:rounded-none sm:rounded-l-[10px] sm:w-[400px] md:w-[500px] lg:w-[560px] xl:w-[640px] 2xl:w-[760px]">
            <DrawerHeader>
              <DrawerTitle>{getDrawerTitle()}</DrawerTitle>
              <DrawerDescription>
                Fill out the form below to register a new {selectedResourceType} record.
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 py-2">
              {renderStatusMessage()}
              {renderForm()}
            </div>

            <DrawerClose asChild className="absolute right-4 top-4">
              <Button variant="outline" onClick={handleDrawerClose}>
                <X className="h-6 w-6" />
              </Button>
            </DrawerClose>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}
