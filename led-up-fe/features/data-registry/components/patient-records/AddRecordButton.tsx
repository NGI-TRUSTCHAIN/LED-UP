// 'use client';

// import { useState, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import { PlusCircle, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuGroup,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import {
//   Drawer,
//   DrawerClose,
//   DrawerContent,
//   DrawerDescription,
//   DrawerHeader,
//   DrawerTitle,
// } from '@/components/ui/drawer';
// import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// import { useAuth } from '@/features/auth/contexts/auth-provider';
// import { useRegisterRecord } from '@/features/data-registry/hooks/use-data-registry';
// import { RecordMetadata, RecordRegistrationParam } from '@/features/data-registry/types';
// import { v4 as uuidv4 } from 'uuid';
// import { toast } from 'sonner';
// import { useWalletClient } from 'wagmi';

// // Import all form components
// import { PatientForm } from '@/features/data-registry/components/forms/patient';
// import { ProcedureForm } from '@/features/data-registry/components/forms/procedure';
// import { ObservationForm } from '@/features/data-registry/components/forms/observation';
// import { MedicationForm } from '@/features/data-registry/components/forms/medication';
// import { ConditionForm } from '@/features/data-registry/components/forms/condition';
// import { AllergyIntoleranceForm } from '@/features/data-registry/components/forms/allergy-intolerance';
// import { ImmunizationForm } from '@/features/data-registry/components/forms/immunization';
// import { DiagnosticReportForm } from '@/features/data-registry/components/forms/diagnostic-report';
// import { EncounterForm } from '@/features/data-registry/components/forms/encounter';
// import { CarePlanForm } from '@/features/data-registry/components/forms/care-plan';
// import { MedicationRequestForm } from '@/features/data-registry/components/forms/medication-request';
// import { MedicationStatementForm } from '@/features/data-registry/components/forms/medication-statement';
// import { FamilyHistoryForm } from '@/features/data-registry/components/forms/family-history';
// import { SocialHistoryForm } from '@/features/data-registry/components/forms/social-history';
// import { AdverseEventForm } from '@/features/data-registry/components/forms/adverse-event';
// import { AppointmentForm } from '@/features/data-registry/components/forms/appointment';
// import { OrganizationForm } from '@/features/data-registry/components/forms/organization';
// import { PractitionerForm } from '@/features/data-registry/components/forms/practitioner';
// import { RelatedPersonForm } from '@/features/data-registry/components/forms/related-person';
// import { LocationForm } from '@/features/data-registry/components/forms/location';
// import { getResourceTypeEnum } from '../../utils/transformation';

// // Define resource types with icons
// const resourceTypes = [
//   { id: 'Patient', label: 'Patient', icon: '👤' },
//   { id: 'Procedure', label: 'Procedure', icon: '🔬' },
//   { id: 'Observation', label: 'Observation', icon: '📊' },
//   { id: 'Medication', label: 'Medication', icon: '💊' },
//   { id: 'Condition', label: 'Condition', icon: '🩺' },
//   { id: 'AllergyIntolerance', label: 'Allergy Intolerance', icon: '⚠️' },
//   { id: 'Immunization', label: 'Immunization', icon: '💉' },
//   { id: 'DiagnosticReport', label: 'Diagnostic Report', icon: '📋' },
//   { id: 'Encounter', label: 'Encounter', icon: '🏥' },
//   { id: 'CarePlan', label: 'Care Plan', icon: '📝' },
//   { id: 'MedicationRequest', label: 'Medication Request', icon: '📑' },
//   { id: 'MedicationStatement', label: 'Medication Statement', icon: '💬' },
//   { id: 'FamilyHistory', label: 'Family History', icon: '👪' },
//   { id: 'SocialHistory', label: 'Social History', icon: '🌐' },
//   { id: 'AdverseEvent', label: 'Adverse Event', icon: '🚨' },
//   { id: 'Appointment', label: 'Appointment', icon: '📅' },
//   { id: 'Organization', label: 'Organization', icon: '🏢' },
//   { id: 'Practitioner', label: 'Practitioner', icon: '👨‍⚕️' },
//   { id: 'RelatedPerson', label: 'Related Person', icon: '👥' },
//   { id: 'Location', label: 'Location', icon: '📍' },
// ];

// // Group resource types by category for better organization in dropdown
// const resourceCategories = [
//   {
//     name: 'Patient Records',
//     items: ['Patient', 'Encounter', 'Condition', 'Observation', 'DiagnosticReport'],
//   },
//   {
//     name: 'Medications',
//     items: ['Medication', 'MedicationRequest', 'MedicationStatement'],
//   },
//   {
//     name: 'Care & Planning',
//     items: ['CarePlan', 'Procedure', 'Immunization', 'Appointment'],
//   },
//   {
//     name: 'History & Allergies',
//     items: ['AllergyIntolerance', 'FamilyHistory', 'SocialHistory', 'AdverseEvent'],
//   },
//   {
//     name: 'Healthcare Providers',
//     items: ['Practitioner', 'Organization', 'RelatedPerson', 'Location'],
//   },
// ];

// export function AddRecordButton() {
//   const [isDrawerOpen, setIsDrawerOpen] = useState(false);
//   const [selectedResourceType, setSelectedResourceType] = useState<string>('');
//   const { did: userDid, address } = useAuth();
//   const { mutateAsync: registerRecord, isPending: isRegistering } = useRegisterRecord();
//   const { data: walletClient } = useWalletClient();
//   const [registrationStatus, setRegistrationStatus] = useState<
//     'idle' | 'preparing' | 'registering' | 'success' | 'error'
//   >('idle');
//   const [errorMessage, setErrorMessage] = useState<string>('');
//   const [recordId, setRecordId] = useState<string>('');
//   const [isInitialized, setIsInitialized] = useState(false);

//   // Use useEffect to ensure state updates don't happen during render
//   useEffect(() => {
//     setIsInitialized(true);
//   }, []);

//   // If not initialized yet, render a minimal version to prevent state updates during hydration
//   if (!isInitialized) {
//     return (
//       <Button className="gap-2" disabled>
//         <PlusCircle className="h-4 w-4" />
//         Add Health Record
//       </Button>
//     );
//   }

//   const handleResourceSelect = (resourceType: string) => {
//     setSelectedResourceType(resourceType);
//     setIsDrawerOpen(true);
//   };

//   // Generate a signature for the record
//   const generateSignature = async (data: any): Promise<string> => {
//     try {
//       if (!walletClient || !address) {
//         throw new Error('Wallet not connected');
//       }

//       // Create a message to sign
//       const message = JSON.stringify({
//         data: data,
//         timestamp: Date.now(),
//         resourceType: selectedResourceType,
//       });

//       // Hash the message
//       const messageHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(message));

//       // Convert hash to hex string
//       const hashArray = Array.from(new Uint8Array(messageHash));
//       const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

//       // Sign the hash with the wallet
//       const signature = await walletClient.signMessage({
//         account: address as `0x${string}`,
//         message: { raw: `0x${hashHex}` as `0x${string}` },
//       });

//       return signature;
//     } catch (error) {
//       console.error('Error generating signature:', error);
//       // Return a placeholder signature if signing fails
//       return '0x0000000000000000000000000000000000000000000000000000000000000000';
//     }
//   };

//   // Create metadata for the record
//   const createMetadata = (data: any): RecordMetadata => {
//     // In a real implementation, this would include IPFS CID, URL, and hash
//     // For now, we'll use placeholder values
//     return {
//       cid: `ipfs://${uuidv4()}`,
//       recordId: `record-${uuidv4()}`,
//       producer: address as `0x${string}`,
//       sharedCount: 0,
//       updatedAt: Date.now(),
//       contentHash: `0x${Array(64)
//         .fill(0)
//         .map(() => Math.floor(Math.random() * 16).toString(16))
//         .join('')}`,
//       resourceType: getResourceTypeEnum(selectedResourceType),
//       dataSize: 10,
//     };
//   };

//   const handleFormSubmit = async (data: any) => {
//     if (!address || !walletClient) {
//       toast.error('Wallet not connected. Please connect your wallet to register a record.');
//       return;
//     }

//     try {
//       // Reset state
//       setRegistrationStatus('preparing');
//       setErrorMessage('');

//       // Get the actual DID from the auth hook
//       const ownerDid = userDid;

//       if (!ownerDid) {
//         throw new Error('Owner DID not found');
//       }

//       // Generate a unique record ID
//       const newRecordId = `record-${uuidv4()}`;
//       setRecordId(newRecordId);

//       // Generate signature
//       const signature = await generateSignature(data);

//       // Create metadata
//       const metadata = createMetadata(data);

//       // Calculate data size - ensure it's a valid number
//       const dataSize = typeof data === 'string' ? new TextEncoder().encode(data).length : JSON.stringify(data).length;

//       // Prepare registration parameters
//       const registrationParams: RecordRegistrationParam = {
//         recordId: newRecordId,
//         cid: metadata.cid,
//         contentHash: metadata.contentHash as `0x${string}`,
//         resourceType: getResourceTypeEnum(selectedResourceType),
//         dataSize: dataSize,
//         producer: address as `0x${string}`,
//       };

//       // Update status
//       setRegistrationStatus('registering');

//       try {
//         // Register the record on the blockchain
//         const result = await registerRecord(registrationParams);

//         console.log('Registration result:', result);

//         // Handle success
//         setRegistrationStatus('success');

//         toast.success(`Your ${selectedResourceType} record has been registered on the blockchain.`);

//         // Close the drawer after 3 seconds
//         setTimeout(() => {
//           setIsDrawerOpen(false);
//           setRegistrationStatus('idle');
//         }, 3000);
//       } catch (registerError) {
//         console.error('Error registering record on blockchain:', registerError);
//         setRegistrationStatus('error');

//         // Extract the specific error message
//         let errorMsg = 'Failed to register record on the blockchain';

//         if (registerError instanceof Error) {
//           // Check for specific error types
//           if (registerError.message.includes('Producer is already registered')) {
//             errorMsg = 'This producer is already registered. Please try a different account.';
//           } else if (registerError.message.includes('RecordAlreadyExists')) {
//             errorMsg = 'This record already exists. Please try again with a different record.';
//           } else if (registerError.message.includes('Unauthorized')) {
//             errorMsg = 'You are not authorized to register this record. Please check your DID and permissions.';
//           } else {
//             errorMsg = registerError.message;
//           }
//         }

//         setErrorMessage(errorMsg);
//         toast.error(errorMsg);
//       }
//     } catch (error) {
//       console.error('Error preparing record for registration:', error);
//       setRegistrationStatus('error');
//       setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
//       toast.error(error instanceof Error ? error.message : 'An unknown error occurred during record preparation');
//     }
//   };

//   // Render the appropriate form based on the selected resource type
//   const renderForm = () => {
//     switch (selectedResourceType) {
//       case 'Patient':
//         return <PatientForm onSubmit={handleFormSubmit} />;
//       case 'Procedure':
//         return <ProcedureForm onSubmit={handleFormSubmit} patientReference={userDid} />;
//       case 'Observation':
//         return <ObservationForm onSubmit={handleFormSubmit} patientReference={userDid} />;
//       case 'Medication':
//         return <MedicationForm onSubmit={handleFormSubmit} />;
//       case 'Condition':
//         return <ConditionForm onSubmit={handleFormSubmit} patientReference={userDid} />;
//       case 'AllergyIntolerance':
//         return <AllergyIntoleranceForm onSubmit={handleFormSubmit} patientReference={userDid} />;
//       case 'Immunization':
//         return <ImmunizationForm onSubmit={handleFormSubmit} patientReference={userDid} />;
//       case 'DiagnosticReport':
//         return <DiagnosticReportForm onSubmit={handleFormSubmit} patientReference={userDid} />;
//       case 'Encounter':
//         return <EncounterForm onSubmit={handleFormSubmit} patientReference={userDid} />;
//       case 'CarePlan':
//         return <CarePlanForm onSubmit={handleFormSubmit} patientReference={userDid} />;
//       case 'MedicationRequest':
//         return <MedicationRequestForm onSubmit={handleFormSubmit} patientReference={userDid} />;
//       case 'MedicationStatement':
//         return <MedicationStatementForm onSubmit={handleFormSubmit} patientReference={userDid} />;
//       case 'FamilyHistory':
//         return <FamilyHistoryForm onSubmit={handleFormSubmit} patientReference={userDid} />;
//       case 'SocialHistory':
//         return <SocialHistoryForm onSubmit={handleFormSubmit} patientReference={userDid} />;
//       case 'AdverseEvent':
//         return <AdverseEventForm onSubmit={handleFormSubmit} patientReference={userDid} />;
//       case 'Appointment':
//         return <AppointmentForm onSubmit={handleFormSubmit} patientReference={userDid} />;
//       case 'Organization':
//         return <OrganizationForm onSubmit={handleFormSubmit} />;
//       case 'Practitioner':
//         return <PractitionerForm onSubmit={handleFormSubmit} />;
//       case 'RelatedPerson':
//         return <RelatedPersonForm onSubmit={handleFormSubmit} patientReference={userDid} />;
//       case 'Location':
//         return <LocationForm onSubmit={handleFormSubmit} />;
//       default:
//         return (
//           <div className="flex flex-col items-center justify-center p-8 text-center">
//             <p className="text-lg text-gray-500">Please select a resource type to continue</p>
//           </div>
//         );
//     }
//   };

//   // Get the title for the drawer based on the selected resource type
//   const getDrawerTitle = () => {
//     const selectedResource = resourceTypes.find((type) => type.id === selectedResourceType);
//     return selectedResource ? `Register ${selectedResource.label}` : 'Register Health Record';
//   };

//   // Render the status message
//   const renderStatusMessage = () => {
//     switch (registrationStatus) {
//       case 'preparing':
//         return (
//           <Alert className="mb-4">
//             <Loader2 className="h-4 w-4 animate-spin" />
//             <AlertTitle>Preparing record</AlertTitle>
//             <AlertDescription>Your health record is being prepared for registration.</AlertDescription>
//           </Alert>
//         );
//       case 'registering':
//         return (
//           <Alert className="mb-4">
//             <Loader2 className="h-4 w-4 animate-spin" />
//             <AlertTitle>Registering on blockchain</AlertTitle>
//             <AlertDescription>
//               Your record is being registered on the blockchain. This may take a moment.
//             </AlertDescription>
//           </Alert>
//         );
//       case 'success':
//         return (
//           <Alert className="mb-4 bg-green-50">
//             <CheckCircle2 className="h-4 w-4 text-green-500" />
//             <AlertTitle>Registration successful</AlertTitle>
//             <AlertDescription>Your record has been successfully registered. Record ID: {recordId}</AlertDescription>
//           </Alert>
//         );
//       case 'error':
//         return (
//           <Alert className="mb-4 bg-red-50" variant="destructive">
//             <AlertCircle className="h-4 w-4" />
//             <AlertTitle>Registration failed</AlertTitle>
//             <AlertDescription>{errorMessage}</AlertDescription>
//           </Alert>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <>
//       <DropdownMenu>
//         <DropdownMenuTrigger asChild>
//           <Button className="gap-2">
//             <PlusCircle className="h-4 w-4" />
//             Add Health Record
//           </Button>
//         </DropdownMenuTrigger>
//         <DropdownMenuContent className="w-56">
//           {resourceCategories.map((category) => (
//             <div key={category.name}>
//               <DropdownMenuLabel>{category.name}</DropdownMenuLabel>
//               <DropdownMenuSeparator />
//               <DropdownMenuGroup>
//                 {category.items.map((itemId) => {
//                   const resource = resourceTypes.find((r) => r.id === itemId);
//                   return resource ? (
//                     <DropdownMenuItem
//                       key={resource.id}
//                       onClick={() => handleResourceSelect(resource.id)}
//                       className="flex items-center"
//                     >
//                       <span className="mr-2">{resource.icon}</span>
//                       {resource.label}
//                     </DropdownMenuItem>
//                   ) : null;
//                 })}
//               </DropdownMenuGroup>
//               <DropdownMenuSeparator />
//             </div>
//           ))}
//         </DropdownMenuContent>
//       </DropdownMenu>

//       {/* Form Drawer */}
//       <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} direction="right">
//         <DrawerContent className="overflow-x-hidden rounded-none mt-0 h-screen overflow-y-auto sm:max-h-screen sm:inset-y-0 sm:right-0 sm:left-auto sm:rounded-none sm:rounded-l-[10px] sm:w-[400px] md:w-[500px] lg:w-[560px] xl:w-[640px] 2xl:w-[760px]">
//           <DrawerHeader>
//             <DrawerTitle>{getDrawerTitle()}</DrawerTitle>
//             <DrawerDescription>
//               Fill out the form below to register a new {selectedResourceType} record.
//             </DrawerDescription>
//           </DrawerHeader>
//           <div className="px-4 py-2">
//             {renderStatusMessage()}
//             {renderForm()}
//           </div>

//           <DrawerClose asChild className="absolute right-4 top-4">
//             <Button variant="outline">
//               <X className="h-6 w-6" />
//             </Button>
//           </DrawerClose>
//         </DrawerContent>
//       </Drawer>
//     </>
//   );
// }
