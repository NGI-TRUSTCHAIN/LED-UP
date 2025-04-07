// 'use client';

// import { useState } from 'react';
// import RegisterProducerForm from './RegisterProducerForm';
// import ProducerRecordsViewer from './ProducerRecordsViewer';
// import { isValidAddress } from '../utils';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Search, AlertCircle } from 'lucide-react';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { DidAuth } from '@/features/auth/components/did-auth';
// import { useAuth } from '@/features/auth/contexts/auth-provider';
// import { Separator } from '@/components/ui/separator';

// export default function DataRegistryPage() {
//   const { isAuthenticated, did, address } = useAuth();
//   const [producerAddress, setProducerAddress] = useState<string>('');
//   const [searchAddress, setSearchAddress] = useState<string>('');
//   const [addressError, setAddressError] = useState<string | null>(null);
//   const [didConnected, setDidConnected] = useState<boolean>(false);

//   const handleSearch = () => {
//     if (!searchAddress.trim()) {
//       setAddressError('Please enter a producer address');
//       return;
//     }

//     if (!isValidAddress(searchAddress)) {
//       setAddressError('Please enter a valid Ethereum address');
//       return;
//     }

//     setProducerAddress(searchAddress);
//     setAddressError(null);
//   };

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter') {
//       handleSearch();
//     }
//   };

//   const handleDidConnectionChange = (connected: boolean) => {
//     setDidConnected(connected);
//   };

//   return (
//     <div className="container mx-auto py-8 max-w-5xl">
//       <div className="mb-8 text-center">
//         <h1 className="text-3xl font-bold tracking-tight">Data Registry</h1>
//         <p className="text-muted-foreground mt-2">Register and manage health data records on the blockchain</p>
//       </div>

//       <div className="space-y-8">
//         {/* Step 1: Authenticate with DID */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Step 1: Authenticate with DID</CardTitle>
//             <CardDescription>
//               Connect your wallet and authenticate with your DID to register as a producer
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <DidAuth onConnectionChange={handleDidConnectionChange} />
//           </CardContent>
//         </Card>

//         {/* Step 2: Register Producer (only shown when authenticated) */}
//         {isAuthenticated && (
//           <Card>
//             <CardHeader>
//               <CardTitle>Step 2: Register Producer</CardTitle>
//               <CardDescription>Register a new producer or update an existing producer's record</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <RegisterProducerForm />
//             </CardContent>
//           </Card>
//         )}

//         {/* Separator */}
//         <Separator className="my-8" />

//         {/* View Records Section */}
//         <Card>
//           <CardHeader>
//             <CardTitle>View Producer Records</CardTitle>
//             <CardDescription>Enter a producer's address to view their records</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="flex gap-2">
//               <div className="flex-1">
//                 <Input
//                   type="text"
//                   placeholder="Enter producer address (0x...)"
//                   value={searchAddress}
//                   onChange={(e) => {
//                     setSearchAddress(e.target.value);
//                     setAddressError(null);
//                   }}
//                   onKeyDown={handleKeyDown}
//                   className="w-full"
//                 />
//               </div>
//               <Button onClick={handleSearch} type="button">
//                 <Search className="h-4 w-4 mr-2" />
//                 Search
//               </Button>
//             </div>

//             {addressError && (
//               <Alert variant="destructive" className="mt-4">
//                 <AlertCircle className="h-4 w-4" />
//                 <AlertDescription>{addressError}</AlertDescription>
//               </Alert>
//             )}

//             {/* Show records if a producer address is entered */}
//             {producerAddress && (
//               <div className="mt-6">
//                 <ProducerRecordsViewer producer={producerAddress} />
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }
