// 'use client';

// import { useEffect, useState } from 'react';
// import { uploadToIPFS, getIPFSData } from '../actions/ipfs';
// import { useAuth } from '@/features/auth/contexts/auth-provider';

// /**
//  * IPFS Upload Demo Component
//  * Demonstrates how to use the updated IPFS upload functionality with backend encryption
//  */
// export function IPFSUploadDemo() {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [result, setResult] = useState<any | null>(null);
//   const [formData, setFormData] = useState({
//     name: '',
//     // description: '',
//     // content: '',
//     resourceType: 'Patient', // Default resource type
//   });

//   useEffect(() => {
//     const fetchData = async () => {
//       const response = await getIPFSData('bafkreifnsc3m6d2weqeou44xpjswz4rpzff5m26cxivf27smiybpz6fzui');
//       console.log('response', response);
//     };
//     fetchData();
//   }, [result]);

//   const { address } = useAuth();

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: name === 'resourceType' ? parseInt(value, 10) : value,
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);
//     setResult(null);

//     let ipfsResponse: any;
//     let recordId = `record-${Date.now()}`;

//     try {
//       // Prepare metadata
//       const data = {
//         recordId: recordId,
//         name: formData.name,
//         resourceType: formData.resourceType,
//         createdAt: Date.now(),
//       };

//       console.log('data', data);
//       console.log('address', address);
//       // Upload to IPFS (backend will encrypt the data)
//       ipfsResponse = await uploadToIPFS(data, address as string);

//       // Log the response
//       console.log('IPFS Upload Response:', ipfsResponse);
//       setResult(ipfsResponse);

//       // // Log the response
//       // console.log('IPFS Upload Response:', ipfsResponse);

//       // // Update blockchain with IPFS reference
//       // try {
//       //   console.log('Updating blockchain with IPFS reference...');

//       //   await updateBlockchain({
//       //     recordId,
//       //     cid: ipfsResponse.cid,
//       //     contentHash: ipfsResponse.contentHash,
//       //     resourceType: formData.resourceType,
//       //     dataSize: ipfsResponse.size,
//       //   });

//       //   console.log('Blockchain updated successfully');

//       // Show success message
//       setResult({
//         ...ipfsResponse,
//         recordId,
//         message: 'Data successfully uploaded to IPFS and registered on blockchain',
//       });
//     } catch (blockchainError) {
//       console.error('Blockchain update error:', blockchainError);
//       setError(blockchainError instanceof Error ? blockchainError.message : 'Unknown blockchain error');
//       setResult({
//         ...ipfsResponse,
//         recordId,
//         message: 'Data uploaded to IPFS but blockchain update failed',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-md">
//       <h2 className="text-2xl font-bold mb-6">IPFS Upload Demo</h2>

//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label htmlFor="title" className="block text-sm font-medium text-gray-700">
//             Title
//           </label>
//           <input
//             type="text"
//             name="name"
//             id="name"
//             placeholder="Enter a name for the record"
//             required
//             value={formData.name}
//             onChange={handleChange}
//             className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
//           />
//         </div>
//         {/*
//         <div>
//           <label htmlFor="description" className="block text-sm font-medium text-gray-700">
//             Description
//           </label>
//           <input
//             type="text"
//             name="description"
//             id="description"
//             value={formData.description}
//             onChange={handleChange}
//             className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
//           />
//         </div> */}

//         {/* <div>
//           <label htmlFor="content" className="block text-sm font-medium text-gray-700">
//             Content
//           </label>
//           <textarea
//             name="content"
//             id="content"
//             required
//             value={formData.content}
//             onChange={handleChange}
//             rows={5}
//             className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
//           />
//         </div> */}

//         <div>
//           <label htmlFor="resourceType" className="block text-sm font-medium text-gray-700">
//             Resource Type
//           </label>
//           <select
//             name="resourceType"
//             id="resourceType"
//             value={formData.resourceType}
//             onChange={handleChange}
//             className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
//           >
//             <option value="Patient">Patient</option>
//             <option value="Procedure">Procedure</option>
//             <option value="Observation">Observation</option>
//             <option value="MedicationRequest">MedicationRequest</option>
//             <option value="Other">Other</option>
//           </select>
//         </div>

//         <div>
//           <button
//             type="submit"
//             disabled={loading}
//             className={`w-full py-2 px-4 rounded-md text-white font-medium bg-primary ${
//               loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
//             }`}
//           >
//             {loading ? 'Uploading...' : 'Upload to IPFS'}
//           </button>
//         </div>
//       </form>

//       {error && (
//         <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
//           <p>
//             <strong>Error:</strong> {error}
//           </p>
//         </div>
//       )}

//       {result && (
//         <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
//           <h3 className="font-bold mb-2">Upload Successful!</h3>
//           <p>
//             <strong>CID:</strong> {result.IpfsHash}
//           </p>
//           <p>
//             <strong>Name:</strong> {result.Name}
//           </p>
//           <p>
//             <strong>Size:</strong> {result.PinSize} bytes
//           </p>
//           {result.recordId && (
//             <p>
//               <strong>Record ID:</strong> {result.recordId}
//             </p>
//           )}
//           {result.message && (
//             <p>
//               <strong>Message:</strong> {result.message}
//             </p>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }
