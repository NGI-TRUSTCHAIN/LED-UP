/**
 * Export all authentication-related server actions
 */

// Authentication actions
export { authenticate } from './authenticate';
export { generateChallenge } from './generateChallenge';
export { refreshToken } from './refreshToken';
export { verifyToken } from './verifyToken';
export { logout } from './logout';
export { refreshAndRedirect } from './refreshAndRedirect';

// DID actions
export { createDid } from './createDid';
export { getDidDocument } from './getDidDocument';
export { updateDidDocument } from './updateDidDocument';
export { deactivateDid } from './deactivateDid';
export { getDidForAddress } from './getDidForAddress';
export { checkDidActive } from './checkDidActive';
export { resolveDid } from './resolveDid';
export { updatePublicKey } from './updatePublicKey';
