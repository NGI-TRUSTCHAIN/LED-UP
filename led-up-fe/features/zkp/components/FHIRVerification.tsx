'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { parseAbi, encodeFunctionData } from 'viem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useSonner } from '@/hooks/use-sonner';
import { Loader2, CheckCircle, AlertCircle, Info, FileText, Calendar, Clock, DownloadCloud } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import {
  RESOURCE_FIELD_MAPPING,
  RESOURCE_TEMPLATES,
  processFHIRResource,
  getFieldLabels,
  generateDisclosureMask,
  applyDisclosureMask,
} from '../utils/fhirDataProcessor';

// Resource types
const RESOURCE_TYPES = [
  { value: '0', label: 'Patient' },
  { value: '1', label: 'Observation' },
  { value: '2', label: 'MedicationRequest' },
  { value: '3', label: 'Condition' },
  { value: '4', label: 'Procedure' },
  { value: '5', label: 'Encounter' },
  { value: '6', label: 'DiagnosticReport' },
  { value: '7', label: 'CarePlan' },
  { value: '8', label: 'Immunization' },
  { value: '9', label: 'AllergyIntolerance' },
  { value: '10', label: 'Device' },
  { value: '11', label: 'Organization' },
  { value: '12', label: 'Practitioner' },
  { value: '13', label: 'Location' },
  { value: '14', label: 'Medication' },
  { value: '15', label: 'Coverage' },
];

// Verification modes
const VERIFICATION_MODES = [
  { value: '1', label: 'Basic Validation' },
  { value: '2', label: 'Selective Disclosure' },
  { value: '3', label: 'Reference Validation' },
];

export default function FHIRVerification() {
  const { address } = useAccount();
  const { toast } = useSonner();

  // State for form inputs
  const [resourceType, setResourceType] = useState('0');
  const [verificationMode, setVerificationMode] = useState('1');
  const [fhirData, setFhirData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [disclosureMask, setDisclosureMask] = useState([1, 1, 1, 1, 1, 1, 1, 1]);
  const [referencedResourceType, setReferencedResourceType] = useState('0');
  const [referencedResourceData, setReferencedResourceData] = useState('');
  const [expirationDays, setExpirationDays] = useState('30');
  const [verificationHistory, setVerificationHistory] = useState<any[]>([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null);
  const [activeVerificationProgress, setActiveVerificationProgress] = useState(0);
  const [fieldLabels, setFieldLabels] = useState<{ [key: number]: string }>({});
  const [referencedFieldLabels, setReferencedFieldLabels] = useState<{ [key: number]: string }>({});

  // Update FHIR data template when resource type changes
  useEffect(() => {
    if (RESOURCE_TEMPLATES[resourceType]) {
      setFhirData(RESOURCE_TEMPLATES[resourceType]);
    }

    // Update field labels
    setFieldLabels(getFieldLabels(resourceType));
  }, [resourceType]);

  // Update referenced field labels when referenced resource type changes
  useEffect(() => {
    setReferencedFieldLabels(getFieldLabels(referencedResourceType));
    if (RESOURCE_TEMPLATES[referencedResourceType]) {
      setReferencedResourceData(RESOURCE_TEMPLATES[referencedResourceType]);
    }
  }, [referencedResourceType]);

  // Load verification history from local storage
  useEffect(() => {
    const storedHistory = localStorage.getItem('fhirVerificationHistory');
    if (storedHistory) {
      try {
        const history = JSON.parse(storedHistory);
        if (Array.isArray(history)) {
          setVerificationHistory(history);
        }
      } catch (error) {
        console.error('Failed to parse verification history:', error);
        toast.error('Failed to parse verification history');
      }
    }
  }, []);

  // Save verification history to local storage
  const saveHistoryToLocalStorage = (history: any[]) => {
    try {
      localStorage.setItem('fhirVerificationHistory', JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save verification history:', error);
      toast.error('Failed to save verification history');
    }
  };

  // Update field labels based on resource type
  const getFieldLabel = (index: number) => {
    return fieldLabels[index] || `Field ${index}`;
  };

  // Get label for referenced field
  const getReferencedFieldLabel = (index: number) => {
    return referencedFieldLabels[index] || `Field ${index}`;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address) {
      toast.error('Wallet not connected', {
        description: 'Please connect your wallet to verify FHIR data.',
      });
      return;
    }

    if (!fhirData) {
      toast.error('Missing data', {
        description: 'Please enter FHIR data to verify.',
      });
      return;
    }

    try {
      setIsLoading(true);
      setActiveVerificationProgress(10);

      // Parse FHIR data
      let parsedData;
      try {
        parsedData = JSON.parse(fhirData);
        setActiveVerificationProgress(20);
      } catch (error) {
        toast.error('Invalid JSON', {
          description: 'Please enter valid JSON data.',
        });
        setIsLoading(false);
        setActiveVerificationProgress(0);
        return;
      }

      // Process the FHIR resource
      setActiveVerificationProgress(30);
      const processedData = await processFHIRResource(resourceType, parsedData);
      setActiveVerificationProgress(50);

      // Prepare request based on verification mode
      const request: any = {
        verificationMode: parseInt(verificationMode),
        resourceType: parseInt(resourceType),
        resourceData: processedData.fieldElements,
        expectedHash: processedData.hash,
        subject: address,
        expirationDays: parseInt(expirationDays),
        metadata: {
          source: 'web-app',
          timestamp: Date.now(),
          resourceInfo: processedData.metadata,
        },
      };

      // Add mode-specific data
      if (verificationMode === '2') {
        // Apply disclosure mask
        const maskedFieldElements = applyDisclosureMask(processedData.fieldElements, disclosureMask);
        request.resourceData = maskedFieldElements;
        request.disclosureMask = disclosureMask;
        request.metadata.disclosedFields = Object.entries(fieldLabels)
          .filter(([key]) => disclosureMask[parseInt(key)] === 1)
          .map(([_, value]) => value);
      } else if (verificationMode === '3') {
        let parsedRefData;
        try {
          parsedRefData = referencedResourceData ? JSON.parse(referencedResourceData) : {};
        } catch (error) {
          toast.error('Invalid referenced data JSON', {
            description: 'Please enter valid JSON for referenced data.',
          });
          setIsLoading(false);
          setActiveVerificationProgress(0);
          return;
        }

        // Process the referenced FHIR resource
        const processedRefData = await processFHIRResource(referencedResourceType, parsedRefData);

        request.referencedResourceType = parseInt(referencedResourceType);
        request.referencedResourceData = processedRefData.fieldElements;
        request.metadata.referencedResourceInfo = processedRefData.metadata;
      }

      setActiveVerificationProgress(70);

      // Call the API to verify the FHIR data
      const response = await fetch('/api/zkp/fhir-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to verify FHIR data');
      }

      setActiveVerificationProgress(90);
      const result = await response.json();

      // Enhance result with additional information
      const enhancedResult = {
        ...result,
        resourceTypeName: RESOURCE_TYPES.find((type) => type.value === resourceType)?.label || 'Unknown',
        verificationModeName: VERIFICATION_MODES.find((mode) => mode.value === verificationMode)?.label || 'Unknown',
        timestamp: new Date().toISOString(),
        rawData: {
          request,
          resourceType: parsedData.resourceType,
          id: parsedData.id,
          extractedFields: processedData.metadata.extractedFields,
        },
      };

      setVerificationResult(enhancedResult);

      // Add to history
      const newHistory = [enhancedResult, ...verificationHistory].slice(0, 50); // Keep only last 50 items
      setVerificationHistory(newHistory);
      saveHistoryToLocalStorage(newHistory);

      toast.success('Verification successful', {
        description: `FHIR data verified successfully. Transaction hash: ${result.txHash.slice(0, 10)}...`,
      });

      setActiveVerificationProgress(100);
      // Reset progress after 1 second
      setTimeout(() => setActiveVerificationProgress(0), 1000);
    } catch (error: any) {
      console.error('Error verifying FHIR data:', error);
      toast.error('Verification failed', {
        description: error.message || 'An error occurred while verifying FHIR data.',
      });
      setActiveVerificationProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle disclosure mask toggle
  const handleDisclosureToggle = (index: number) => {
    const newMask = [...disclosureMask];
    newMask[index] = newMask[index] === 1 ? 0 : 1;
    setDisclosureMask(newMask);
  };

  // Handle exporting verification result
  const exportVerificationResult = (result: any) => {
    try {
      const data = JSON.stringify(result, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fhir-verification-${result.verificationId}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Export successful', {
        description: 'Verification result has been exported as JSON.',
      });
    } catch (error) {
      console.error('Error exporting verification result:', error);
      toast.error('Export failed', {
        description: 'Failed to export verification result.',
      });
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">FHIR Data Verification</CardTitle>
          <CardDescription>
            Verify FHIR resources using zero-knowledge proofs to protect sensitive health information.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {activeVerificationProgress > 0 && (
            <div className="mb-4">
              <Progress value={activeVerificationProgress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {activeVerificationProgress < 100
                  ? `Verification in progress (${activeVerificationProgress}%)...`
                  : 'Verification complete!'}
              </p>
            </div>
          )}

          <Tabs defaultValue="verify" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="verify">Verify FHIR Data</TabsTrigger>
              <TabsTrigger value="results">Verification Results</TabsTrigger>
              <TabsTrigger value="history">Verification History</TabsTrigger>
            </TabsList>

            <TabsContent value="verify">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="resourceType">Resource Type</Label>
                    <Select value={resourceType} onValueChange={setResourceType}>
                      <SelectTrigger id="resourceType">
                        <SelectValue placeholder="Select resource type" />
                      </SelectTrigger>
                      <SelectContent>
                        {RESOURCE_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="verificationMode">Verification Mode</Label>
                    <Select value={verificationMode} onValueChange={setVerificationMode}>
                      <SelectTrigger id="verificationMode">
                        <SelectValue placeholder="Select verification mode" />
                      </SelectTrigger>
                      <SelectContent>
                        {VERIFICATION_MODES.map((mode) => (
                          <SelectItem key={mode.value} value={mode.value}>
                            {mode.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="fhirData">FHIR Resource Data (JSON)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFhirData(RESOURCE_TEMPLATES[resourceType] || '')}
                    >
                      Load Template
                    </Button>
                  </div>
                  <Textarea
                    id="fhirData"
                    placeholder='{"resourceType": "Patient", "id": "example", ...}'
                    value={fhirData}
                    rows={10}
                    onChange={(e) => setFhirData(e.target.value)}
                    className="min-h-[200px] font-mono"
                  />
                </div>

                {verificationMode === '2' && (
                  <div className="space-y-2">
                    <Label>Selective Disclosure</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Select which fields to disclose in the verification.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {disclosureMask.map((value, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Checkbox
                            id={`field-${index}`}
                            checked={value === 1}
                            onCheckedChange={() => handleDisclosureToggle(index)}
                            disabled={index === 0} // Always disclose resource type
                          />
                          <Label htmlFor={`field-${index}`}>{getFieldLabel(index)}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {verificationMode === '3' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="referencedResourceType">Referenced Resource Type</Label>
                      <Select value={referencedResourceType} onValueChange={setReferencedResourceType}>
                        <SelectTrigger id="referencedResourceType">
                          <SelectValue placeholder="Select referenced resource type" />
                        </SelectTrigger>
                        <SelectContent>
                          {RESOURCE_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="referencedResourceData">Referenced Resource Data (JSON)</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setReferencedResourceData(RESOURCE_TEMPLATES[referencedResourceType] || '')}
                        >
                          Load Template
                        </Button>
                      </div>
                      <Textarea
                        id="referencedResourceData"
                        placeholder='{"resourceType": "Observation", "id": "example", ...}'
                        value={referencedResourceData}
                        onChange={(e) => setReferencedResourceData(e.target.value)}
                        className="min-h-[150px] font-mono"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="expirationDays">Verification Expiration (days)</Label>
                  <Input
                    id="expirationDays"
                    type="number"
                    min="0"
                    value={expirationDays}
                    onChange={(e) => setExpirationDays(e.target.value)}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">Set to 0 for no expiration.</p>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify FHIR Data'
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="results">
              {verificationResult ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-green-900">Verification Successful</h3>
                      <p className="text-green-700 text-sm">The FHIR data has been successfully verified.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-sm text-muted-foreground">Resource Type</Label>
                      <p className="font-medium">{verificationResult.resourceTypeName}</p>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-sm text-muted-foreground">Verification Mode</Label>
                      <p className="font-medium">{verificationResult.verificationModeName}</p>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-sm text-muted-foreground">Verification ID</Label>
                      <p className="font-medium">{verificationResult.verificationId}</p>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-sm text-muted-foreground">Expiration</Label>
                      <p className="font-medium">{formatDate(verificationResult.expirationTime)}</p>
                    </div>

                    <div className="space-y-1 col-span-2">
                      <Label className="text-sm text-muted-foreground">Transaction Hash</Label>
                      <p className="font-mono text-sm break-all">{verificationResult.txHash}</p>
                    </div>

                    {verificationMode === '2' && (
                      <div className="space-y-1 col-span-2">
                        <Label className="text-sm text-muted-foreground">Disclosed Fields</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {disclosureMask.map((value, index) =>
                            value === 1 ? (
                              <Badge key={index} variant="outline">
                                {getFieldLabel(index)}
                              </Badge>
                            ) : null
                          )}
                        </div>
                      </div>
                    )}

                    {verificationMode === '3' && (
                      <div className="space-y-1 col-span-2">
                        <Label className="text-sm text-muted-foreground">Referenced Resource</Label>
                        <p className="font-medium">
                          {RESOURCE_TYPES.find((type) => type.value === referencedResourceType)?.label}
                        </p>
                      </div>
                    )}

                    {verificationResult.rawData?.extractedFields && (
                      <div className="space-y-1 col-span-2">
                        <Label className="text-sm text-muted-foreground">Extracted Field Values</Label>
                        <div className="bg-slate-50 p-3 rounded-md mt-1">
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(verificationResult.rawData.extractedFields).map(
                              ([field, value]: [string, any]) => (
                                <div key={field} className="space-y-1">
                                  <p className="text-xs font-medium">
                                    {field.charAt(0).toUpperCase() + field.slice(1)}
                                  </p>
                                  <p className="text-xs truncate">
                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Proof Details</Label>
                    <div className="bg-slate-50 p-3 rounded-md">
                      <pre className="text-xs overflow-auto max-h-[200px]">
                        {JSON.stringify(verificationResult.proof, null, 2)}
                      </pre>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => exportVerificationResult(verificationResult)}>
                      <DownloadCloud className="h-4 w-4 mr-2" />
                      Export Result
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Info className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-1">No verification results</h3>
                  <p className="text-slate-500">Verify FHIR data to see results here.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history">
              {verificationHistory.length > 0 ? (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Verification ID</TableHead>
                        <TableHead>Resource Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Mode</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {verificationHistory.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-xs">{item.verificationId.substring(0, 8)}...</TableCell>
                          <TableCell>{item.resourceTypeName}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            {formatDate(item.timestamp).split(',')[0]}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.verificationModeName}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                              Verified
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  Actions
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setVerificationResult(item)}>
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => exportVerificationResult(item)}>
                                  Export
                                </DropdownMenuItem>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                      View Raw Data
                                    </DropdownMenuItem>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>Raw Verification Data</DialogTitle>
                                      <DialogDescription>
                                        Detailed information about the verification.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="bg-slate-50 p-3 rounded-md">
                                      <pre className="text-xs overflow-auto max-h-[400px]">
                                        {JSON.stringify(item, null, 2)}
                                      </pre>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="text-center text-sm text-muted-foreground pt-2">
                    Showing {verificationHistory.length} verification results
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-1">No verification history</h3>
                  <p className="text-slate-500">Your verification history will appear here.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-6">
          <p className="text-sm text-muted-foreground">
            Zero-knowledge proofs protect your sensitive health information.
          </p>
          <Button variant="outline" onClick={() => setVerificationResult(null)}>
            Clear Results
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
