import { Button } from '@/components/ui/button';
import { Dialog, DialogTitle, DialogHeader, DialogContent, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/features/auth/contexts/auth-provider';
import { useCreateRecordWithIPFS } from '../../hooks/use-ipfs-mutations';
import { useState, useRef } from 'react';
import { useWalletClient } from 'wagmi';
import { useSignData } from '@/lib/signature';
import { toast } from 'sonner';
import { hashData } from '@/lib/hash';
import { v4 as uuidv4 } from 'uuid';
import { AlertCircle, CheckCircle2, FileUp, X, Upload, FileText } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const ResourceModal = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [jsonResource, setJsonResource] = useState<any>(null);
  const [resourceString, setResourceString] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { did: userDid, address } = useAuth();
  const { mutateAsync: registerProducerRecord } = useCreateRecordWithIPFS();
  const { data: walletClient } = useWalletClient();
  const [registrationStatus, setRegistrationStatus] = useState<
    'idle' | 'preparing' | 'registering' | 'success' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [recordId, setRecordId] = useState<string>('');
  const signDataMutation = useSignData();

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setRegistrationStatus('idle');
    setErrorMessage('');
    setJsonResource(null);
    setResourceString('');
    setRecordId('');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedJson = JSON.parse(content);
        setJsonResource(parsedJson);
        setResourceString(JSON.stringify(parsedJson, null, 2));
        // Reset status when new file is uploaded
        setRegistrationStatus('idle');
        setErrorMessage('');
      } catch (error) {
        console.error('Error parsing JSON file:', error);
        toast.error('Invalid JSON file. Please upload a valid JSON resource.');
        setJsonResource(null);
        setResourceString('');
      }
    };
    reader.readAsText(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (!jsonResource) {
      toast.error('Please upload a JSON resource file first.');
      return;
    }

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

      // Verify resourceType exists in the uploaded JSON
      if (!jsonResource.resourceType) {
        throw new Error('Resource type not found in the JSON file. Please ensure it has a resourceType field.');
      }

      // Generate a unique record ID if not present
      let recordId = '';
      const tempId = jsonResource.id || uuidv4();
      const resourceTypeForId = jsonResource.resourceType;
      recordId = `${resourceTypeForId}-${tempId}`;

      if (!jsonResource.id) {
        jsonResource.id = tempId;
      }

      setRecordId(recordId);

      // Generate signature
      const contentHash = await hashData(
        JSON.stringify({
          data: jsonResource,
          timestamp: Date.now(),
          producer: address as string,
        })
      );

      const signature = await signDataMutation.mutateAsync(contentHash);

      // Add necessary properties to the data object
      const enhancedData = {
        resource: jsonResource,
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

        toast.success(`Your ${resourceTypeForId} record has been registered on the blockchain.`);

        // Close the dialog after 3 seconds
        setTimeout(() => {
          setIsDialogOpen(false);
          setRegistrationStatus('idle');
          setJsonResource(null);
          setResourceString('');
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
      <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="gap-2">
        <FileUp className="h-4 w-4" />
        Upload Resource
      </Button>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleDialogClose();
          } else {
            setIsDialogOpen(true);
          }
        }}
      >
        <DialogContent className="sm:max-w-[720px] overflow-y-auto max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Upload FHIR Resource
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            {renderStatusMessage()}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="application/json"
              className="hidden"
              aria-label="Upload JSON resource file"
            />

            {!jsonResource ? (
              <Card
                className={cn(
                  'border-dashed border-2 cursor-pointer hover:border-primary/50 transition-colors',
                  'flex flex-col items-center justify-center p-8 text-center'
                )}
                onClick={triggerFileInput}
              >
                <CardContent className="flex flex-col items-center justify-center pt-6">
                  <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="mb-2 text-lg font-semibold">Click to upload JSON resource</p>
                  <p className="text-sm text-muted-foreground">Upload a valid FHIR resource in JSON format</p>
                </CardContent>
              </Card>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-md font-medium">
                      Resource Type: <span className="font-bold">{jsonResource.resourceType}</span>
                    </h3>
                    {jsonResource.id && <p className="text-sm text-muted-foreground">ID: {jsonResource.id}</p>}
                  </div>
                  <Button size="sm" variant="outline" onClick={triggerFileInput}>
                    Change File
                  </Button>
                </div>

                <div className="relative rounded-lg border bg-muted p-1">
                  <pre className="overflow-auto p-4 text-sm max-h-[280px]">
                    <code className="text-xs">{resourceString}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between gap-2 mt-6">
            <Button variant="outline" onClick={handleDialogClose}>
              Cancel
            </Button>
            <Button
              disabled={!jsonResource || registrationStatus === 'preparing' || registrationStatus === 'registering'}
              onClick={handleSubmit}
              className="gap-2"
            >
              {(registrationStatus === 'preparing' || registrationStatus === 'registering') && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Create Resource
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ResourceModal;
