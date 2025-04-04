// 'use client';

// import { useEffect, useState } from 'react';
// import { getProducerRecords, producerExists } from '../actions';
// import { ConsentStatus, HealthRecord, RecordStatus } from '../types';
// import { getConsentLabel, getStatusLabel } from '../helpers/status-labels';
// import { formatAddress } from '../utils';
// import { AlertCircle, CheckCircle, ExternalLink, Copy, Check } from 'lucide-react';
// import { useSonner } from '@/hooks/use-sonner';

// // Shadcn UI components
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
// import { Skeleton } from '@/components/ui/skeleton';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// interface ProducerRecordsViewerProps {
//   producer: string;
// }

// export default function ProducerRecordsViewer({ producer }: ProducerRecordsViewerProps) {
//   const [records, setRecords] = useState<any>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [exists, setExists] = useState<boolean | null>(null);
//   const [copied, setCopied] = useState<string | null>(null);
//   const { toast } = useSonner();

//   useEffect(() => {
//     // Use an async function to fetch data
//     async function fetchData() {
//       if (!producer) {
//         setLoading(false);
//         setError('Producer address is required');
//         return;
//       }

//       try {
//         // First check if the producer exists
//         const existsResult = await producerExists(producer);
//         setExists(existsResult);

//         if (existsResult) {
//           // If producer exists, fetch their records
//           const recordsData = await getProducerRecords(producer);
//           setRecords(recordsData);
//           toast.success('Record Loaded', {
//             description: 'Producer records loaded successfully',
//           });
//         }

//         setLoading(false);
//       } catch (err) {
//         const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching data';
//         setError(errorMessage);
//         toast.error('Error', {
//           description: errorMessage,
//         });
//         setLoading(false);
//       }
//     }

//     fetchData();
//   }, [producer, toast]);

//   // Function to copy text to clipboard
//   const copyToClipboard = (text: string, label: string) => {
//     navigator.clipboard.writeText(text);
//     setCopied(label);
//     toast.success('Copied', {
//       description: `${label} copied to clipboard`,
//     });

//     // Reset copied state after 2 seconds
//     setTimeout(() => {
//       setCopied(null);
//     }, 2000);
//   };

//   if (loading) {
//     return (
//       <Card>
//         <CardHeader>
//           <Skeleton className="h-8 w-3/4" />
//           <Skeleton className="h-4 w-1/2" />
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="grid grid-cols-2 gap-4">
//             {[1, 2, 3, 4].map((i) => (
//               <div key={i} className="space-y-2">
//                 <Skeleton className="h-4 w-1/3" />
//                 <Skeleton className="h-6 w-full" />
//               </div>
//             ))}
//           </div>
//           <Skeleton className="h-8 w-1/4 mt-4" />
//           <div className="space-y-4">
//             {[1, 2].map((i) => (
//               <Skeleton key={i} className="h-32 w-full" />
//             ))}
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   if (error) {
//     return (
//       <Alert variant="destructive">
//         <AlertCircle className="h-4 w-4" />
//         <AlertTitle>Error</AlertTitle>
//         <AlertDescription>{error}</AlertDescription>
//       </Alert>
//     );
//   }

//   if (exists === false) {
//     return (
//       <Alert className="bg-yellow-50 text-yellow-800 border-yellow-200">
//         <AlertCircle className="h-4 w-4" />
//         <AlertTitle>Producer Not Found</AlertTitle>
//         <AlertDescription>
//           The producer with address {formatAddress(producer)} does not exist in the registry.
//         </AlertDescription>
//       </Alert>
//     );
//   }

//   // Destructure the records data
//   const [status, consent, healthRecords, recordIds, nonce] = records || [];

//   return (
//     <Card className="w-full">
//       <CardHeader>
//         <div className="flex justify-between items-center">
//           <div>
//             <CardTitle>Producer Records</CardTitle>
//             <CardDescription>Viewing records for producer {formatAddress(producer)}</CardDescription>
//           </div>
//           <TooltipProvider>
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Button variant="outline" size="sm" onClick={() => copyToClipboard(producer, 'Producer address')}>
//                   {copied === 'Producer address' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
//                 </Button>
//               </TooltipTrigger>
//               <TooltipContent>
//                 <p>Copy producer address</p>
//               </TooltipContent>
//             </Tooltip>
//           </TooltipProvider>
//         </div>
//       </CardHeader>

//       <CardContent className="space-y-6">
//         <div className="grid grid-cols-2 gap-4">
//           <Card className="bg-muted/50">
//             <CardContent className="pt-6">
//               <div className="flex justify-between items-center">
//                 <p className="text-sm text-muted-foreground">Status</p>
//                 <Badge className={status === RecordStatus.Active ? 'bg-green-100 text-green-800' : ''}>
//                   {getStatusLabel(status)}
//                 </Badge>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="bg-muted/50">
//             <CardContent className="pt-6">
//               <div className="flex justify-between items-center">
//                 <p className="text-sm text-muted-foreground">Consent</p>
//                 <Badge
//                   className={
//                     consent === ConsentStatus.Allowed
//                       ? 'bg-green-100 text-green-800'
//                       : consent === ConsentStatus.Denied
//                       ? 'bg-red-100 text-red-800'
//                       : ''
//                   }
//                 >
//                   {getConsentLabel(consent)}
//                 </Badge>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="bg-muted/50">
//             <CardContent className="pt-6">
//               <div className="flex justify-between items-center">
//                 <p className="text-sm text-muted-foreground">Record Count</p>
//                 <p className="font-medium">{recordIds?.length || 0}</p>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="bg-muted/50">
//             <CardContent className="pt-6">
//               <div className="flex justify-between items-center">
//                 <p className="text-sm text-muted-foreground">Nonce</p>
//                 <p className="font-medium">{nonce?.toString() || '0'}</p>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         <div>
//           <h3 className="text-xl font-semibold mb-3">Health Records</h3>

//           {healthRecords && healthRecords.length > 0 ? (
//             <Accordion type="single" collapsible className="w-full">
//               {healthRecords.map((record: HealthRecord, index: number) => (
//                 <AccordionItem key={index} value={`record-${index}`}>
//                   <AccordionTrigger className="hover:no-underline">
//                     <div className="flex items-center justify-between w-full pr-4">
//                       <div className="flex items-center gap-2">
//                         <span className="font-medium">{recordIds[index]}</span>
//                         <Badge variant="outline">{record.resourceType}</Badge>
//                       </div>
//                       <Badge
//                         className={record.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
//                       >
//                         {record.isVerified ? 'Verified' : 'Not Verified'}
//                       </Badge>
//                     </div>
//                   </AccordionTrigger>
//                   <AccordionContent>
//                     <Tabs defaultValue="details" className="w-full">
//                       <TabsList className="grid w-full grid-cols-2">
//                         <TabsTrigger value="details">Details</TabsTrigger>
//                         <TabsTrigger value="technical">Technical Info</TabsTrigger>
//                       </TabsList>
//                       <TabsContent value="details" className="space-y-4 pt-4">
//                         <div className="grid grid-cols-2 gap-2">
//                           <div>
//                             <p className="text-sm text-muted-foreground">Record ID</p>
//                             <div className="flex items-center gap-1">
//                               <p className="font-medium">{recordIds[index]}</p>
//                               <Button
//                                 variant="ghost"
//                                 size="icon"
//                                 className="h-6 w-6"
//                                 onClick={() => copyToClipboard(recordIds[index], `Record ID ${index}`)}
//                               >
//                                 {copied === `Record ID ${index}` ? (
//                                   <Check className="h-3 w-3" />
//                                 ) : (
//                                   <Copy className="h-3 w-3" />
//                                 )}
//                               </Button>
//                             </div>
//                           </div>
//                           <div>
//                             <p className="text-sm text-muted-foreground">Resource Type</p>
//                             <p className="font-medium">{record.resourceType}</p>
//                           </div>
//                         </div>

//                         <div>
//                           <p className="text-sm text-muted-foreground">Verification Status</p>
//                           <div className="flex items-center gap-2 mt-1">
//                             {record.isVerified ? (
//                               <>
//                                 <CheckCircle className="h-4 w-4 text-green-600" />
//                                 <span className="text-green-600 font-medium">Verified</span>
//                               </>
//                             ) : (
//                               <>
//                                 <AlertCircle className="h-4 w-4 text-yellow-600" />
//                                 <span className="text-yellow-600 font-medium">Not Verified</span>
//                               </>
//                             )}
//                           </div>
//                         </div>
//                       </TabsContent>

//                       <TabsContent value="technical" className="space-y-4 pt-4">
//                         <div>
//                           <p className="text-sm text-muted-foreground">IPFS CID</p>
//                           <div className="flex items-center gap-1">
//                             <p className="font-mono text-xs break-all">{record.cid}</p>
//                             <Button
//                               variant="ghost"
//                               size="icon"
//                               className="h-6 w-6 flex-shrink-0"
//                               onClick={() => copyToClipboard(record.cid, `CID ${index}`)}
//                             >
//                               {copied === `CID ${index}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
//                             </Button>
//                           </div>
//                         </div>

//                         <div>
//                           <p className="text-sm text-muted-foreground">URL</p>
//                           <div className="flex items-center gap-1">
//                             <a
//                               href={record.url}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               className="text-primary hover:underline break-all flex items-center gap-1"
//                             >
//                               {record.url}
//                               <ExternalLink className="h-3 w-3" />
//                             </a>
//                             <Button
//                               variant="ghost"
//                               size="icon"
//                               className="h-6 w-6 flex-shrink-0"
//                               onClick={() => copyToClipboard(record.url, `URL ${index}`)}
//                             >
//                               {copied === `URL ${index}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
//                             </Button>
//                           </div>
//                         </div>

//                         <div>
//                           <p className="text-sm text-muted-foreground">Hash</p>
//                           <div className="flex items-center gap-1">
//                             <p className="font-mono text-xs break-all">{record.hash}</p>
//                             <Button
//                               variant="ghost"
//                               size="icon"
//                               className="h-6 w-6 flex-shrink-0"
//                               onClick={() => copyToClipboard(record.hash, `Hash ${index}`)}
//                             >
//                               {copied === `Hash ${index}` ? (
//                                 <Check className="h-3 w-3" />
//                               ) : (
//                                 <Copy className="h-3 w-3" />
//                               )}
//                             </Button>
//                           </div>
//                         </div>
//                       </TabsContent>
//                     </Tabs>
//                   </AccordionContent>
//                 </AccordionItem>
//               ))}
//             </Accordion>
//           ) : (
//             <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-md">
//               <p>No health records found for this producer.</p>
//             </div>
//           )}
//         </div>
//       </CardContent>

//       <CardFooter>
//         <Button
//           variant="outline"
//           onClick={() => {
//             setLoading(true);
//             fetchData();
//           }}
//           className="w-full"
//         >
//           Refresh Records
//         </Button>
//       </CardFooter>
//     </Card>
//   );

//   // Function to fetch data (defined inside component to access state)
//   async function fetchData() {
//     if (!producer) {
//       setLoading(false);
//       setError('Producer address is required');
//       return;
//     }

//     try {
//       // First check if the producer exists
//       const existsResult = await producerExists(producer);
//       setExists(existsResult);

//       if (existsResult) {
//         // If producer exists, fetch their records
//         const recordsData = await getProducerRecords(producer);
//         setRecords(recordsData);
//         toast.success('Success', {
//           description: 'Producer records refreshed',
//         });
//       }

//       setLoading(false);
//     } catch (err) {
//       const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching data';
//       setError(errorMessage);
//       toast.error('Error', {
//         description: errorMessage,
//       });
//       setLoading(false);
//     }
//   }
// }
