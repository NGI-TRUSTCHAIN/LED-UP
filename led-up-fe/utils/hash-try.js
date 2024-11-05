const { createHash } = require('crypto');
const data = require('./patient.json');

function computeHash(data) {
  let jsonStr = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  const hash = createHash('sha256');
  hash.update(jsonStr);
  return hash.digest('hex'); // Return hash as a hex string
}

const prepareField = async (data) => {
  const hash = computeHash(data);
  const firstSegment = hash.substring(0, 32); // First 128 bits
  const secondSegment = hash.substring(32, 64); // Second 128 bits
  return [firstSegment, secondSegment, '00000000000000000000000000000000', '00000000000000000000000000000000'];
};

// const data = {
//   resourceType: 'Patient',
//   id: 'd0658787-9eeb-4b40-9053-09e1adacdf6a',
//   meta: {
//     versionId: '1',
//     lastUpdated: '2024-04-19T04:55:59.038+00:00',
//   },
//   active: true,
//   name: [
//     {
//       use: 'official',
//       family: 'Smith',
//       given: ['Lisa', 'Marie'],
//     },
//     {
//       use: 'usual',
//       given: ['Lisa'],
//     },
//   ],
//   gender: 'female',
//   birthDate: '1974-12-25',
// };

// prepareField(data).then(console.log);
