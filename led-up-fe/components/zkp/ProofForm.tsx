// 'use client';
// import { useState } from 'react';
// import { generateProof, verifyProofOnChain } from '@/lib/zokrates';

// const ProofForm: React.FC = () => {
//   const [secret, setSecret] = useState<string[]>(['0', '0', '0', '0']);
//   const [expectedHash, setExpectedHash] = useState<string>('0');
//   const [proof, setProof] = useState<any>(null);
//   const [isValid, setIsValid] = useState<boolean | null>(null);

//   const handleGenerateProof = async () => {
//     try {
//       const generatedProof = await generateProof(secret, expectedHash);
//       setProof(generatedProof);
//     } catch (err) {
//       console.error('Proof generation failed:', err);
//     }
//   };

//   const handleVerifyProof = async () => {
//     try {
//       const isValid = await verifyProofOnChain(proof);
//       setIsValid(isValid);
//     } catch (err) {
//       console.error('Proof verification failed:', err);
//     }
//   };

//   return (
//     <div>
//       <h2>Submit Private Data & Verify Hash</h2>
//       <form>
//         <label>
//           Secret Data (4 values):
//           <input
//             type="text"
//             value={secret[0]}
//             onChange={(e) => setSecret([e.target.value, secret[1], secret[2], secret[3]])}
//           />
//           <input
//             type="text"
//             value={secret[1]}
//             onChange={(e) => setSecret([secret[0], e.target.value, secret[2], secret[3]])}
//           />
//           <input
//             type="text"
//             value={secret[2]}
//             onChange={(e) => setSecret([secret[0], secret[1], e.target.value, secret[3]])}
//           />
//           <input
//             type="text"
//             value={secret[3]}
//             onChange={(e) => setSecret([secret[0], secret[1], secret[2], e.target.value])}
//           />
//         </label>
//         <label>
//           Expected Hash:
//           <input type="text" value={expectedHash} onChange={(e) => setExpectedHash(e.target.value)} />
//         </label>
//       </form>
//       <button onClick={handleGenerateProof}>Generate Proof</button>
//       {proof && <button onClick={handleVerifyProof}>Verify Proof</button>}

//       {isValid !== null && <div>Proof is {isValid ? 'valid' : 'invalid'}</div>}
//     </div>
//   );
// };

// export default ProofForm;
