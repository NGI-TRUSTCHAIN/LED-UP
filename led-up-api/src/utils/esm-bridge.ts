// // This file is a bridge between ESM-only modules and CommonJS
// // It uses dynamic imports to load ESM modules in a CommonJS context

// /**
//  * Load the helia module dynamically
//  * @returns {Promise<any>} The helia module
//  */
// async function loadHelia(): Promise<any> {
//   try {
//     return await import('helia');
//   } catch (err) {
//     console.error('Failed to load helia:', err);
//     throw err;
//   }
// }

// /**
//  * Load the helia strings module dynamically
//  * @returns {Promise<any>} The strings module
//  */
// async function loadStrings(): Promise<any> {
//   try {
//     return await import('@helia/strings');
//   } catch (err) {
//     console.error('Failed to load @helia/strings:', err);
//     throw err;
//   }
// }

// /**
//  * Load the helia json module dynamically
//  * @returns {Promise<any>} The json module
//  */
// async function loadJson(): Promise<any> {
//   try {
//     return await import('@helia/json');
//   } catch (err) {
//     console.error('Failed to load @helia/json:', err);
//     throw err;
//   }
// }

// /**
//  * Load the helia unixfs module dynamically
//  * @returns {Promise<any>} The unixfs module
//  */
// async function loadUnixfs(): Promise<any> {
//   try {
//     return await import('@helia/unixfs');
//   } catch (err) {
//     console.error('Failed to load @helia/unixfs:', err);
//     throw err;
//   }
// }

// export { loadHelia, loadStrings, loadJson, loadUnixfs };
