const crypto = require('crypto');

// Simulate the concatenation of four field elements
const data = [
  Buffer.from('01', 'hex'), // Field element 1
  Buffer.from('02', 'hex'), // Field element 2
  Buffer.from('03', 'hex'), // Field element 3
  Buffer.from('04', 'hex'), // Field element 4
];

// Concatenate the data into a single buffer (simulating 512 bits or 64 bytes)
const concatenatedData = Buffer.concat(data);

// Hash the concatenated data using SHA-256
const hash = crypto.createHash('sha256').update(concatenatedData).digest('hex');

// Print the hash
// console.log('SHA-256 hash of concatenated data:', hash);
