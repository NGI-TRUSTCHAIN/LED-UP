// 'use client';

// import { useAccount } from 'wagmi';
// import { useProducerExists, useProducerRecords, useRegisterProducer } from '../hooks';
// import { ConsentStatus, RecordStatus } from '../types';
// import { useState } from 'react';

// /**
//  * Example component that demonstrates how to use the data registry hooks
//  */
// export function ProducerRecordsExample() {
//   const { address } = useAccount();
//   const [isRegistering, setIsRegistering] = useState(false);

//   // Check if the current user is a registered producer
//   const { data: exists, isLoading: isLoadingExists } = useProducerExists(address);

//   // Get the producer records if the user is a registered producer
//   const { data: records, isLoading: isLoadingRecords } = useProducerRecords(address);

//   // Mutation hook for registering a producer
//   const { mutate: registerProducer, isPending: isRegisterPending } = useRegisterProducer();

//   // Handle registering as a producer
//   const handleRegister = () => {
//     setIsRegistering(true);
//     registerProducer(
//       {
//         status: RecordStatus.Active,
//         consent: ConsentStatus.Allowed,
//       },
//       {
//         onSuccess: () => {
//           setIsRegistering(false);
//         },
//         onError: (error) => {
//           console.error('Error registering producer:', error);
//           setIsRegistering(false);
//         },
//       }
//     );
//   };

//   if (!address) {
//     return (
//       <div className="p-4 bg-gray-100 rounded-lg">
//         <h2 className="text-xl font-bold mb-4">Data Registry Example</h2>
//         <p>Please connect your wallet to use this feature.</p>
//       </div>
//     );
//   }

//   if (isLoadingExists) {
//     return (
//       <div className="p-4 bg-gray-100 rounded-lg">
//         <h2 className="text-xl font-bold mb-4">Data Registry Example</h2>
//         <p>Checking if you are a registered producer...</p>
//       </div>
//     );
//   }

//   if (!exists) {
//     return (
//       <div className="p-4 bg-gray-100 rounded-lg">
//         <h2 className="text-xl font-bold mb-4">Data Registry Example</h2>
//         <p>You are not registered as a producer.</p>
//         <button
//           className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
//           onClick={handleRegister}
//           disabled={isRegisterPending || isRegistering}
//         >
//           {isRegisterPending || isRegistering ? 'Registering...' : 'Register as Producer'}
//         </button>
//       </div>
//     );
//   }

//   if (isLoadingRecords) {
//     return (
//       <div className="p-4 bg-gray-100 rounded-lg">
//         <h2 className="text-xl font-bold mb-4">Data Registry Example</h2>
//         <p>Loading your records...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="p-4 bg-gray-100 rounded-lg">
//       <h2 className="text-xl font-bold mb-4">Data Registry Example</h2>
//       <p>You are registered as a producer.</p>

//       <div className="mt-4">
//         <h3 className="text-lg font-semibold mb-2">Your Records</h3>
//         {records && records.healthRecords.length > 0 ? (
//           <div className="space-y-4">
//             {records.healthRecords.map((record, index) => (
//               <div key={index} className="p-3 bg-white rounded shadow">
//                 <p>
//                   <strong>Resource Type:</strong> {record.resourceType}
//                 </p>
//                 <p>
//                   <strong>CID:</strong> {record.cid}
//                 </p>
//                 <p>
//                   <strong>URL:</strong> {record.url}
//                 </p>
//                 <p>
//                   <strong>Verified:</strong> {record.isVerified ? 'Yes' : 'No'}
//                 </p>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <p>You don't have any records yet.</p>
//         )}
//       </div>

//       <div className="mt-4">
//         <h3 className="text-lg font-semibold mb-2">Status Information</h3>
//         <p>
//           <strong>Record Status:</strong> {RecordStatus[records?.status || 0]}
//         </p>
//         <p>
//           <strong>Consent Status:</strong> {ConsentStatus[records?.consent || 0]}
//         </p>
//         <p>
//           <strong>Record Count:</strong> {records?.recordIds.length || 0}
//         </p>
//       </div>
//     </div>
//   );
// }
