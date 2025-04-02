/**
 * Import all authentication-related functions.
 * This ensures all functions are registered with the Azure Functions runtime.
 */
import './authenticate';
import './generateChallenge';
import './refreshToken';
import './verifyToken';
import './createDid';
import './getDidDocument';
import './updateDidDocument';
import './deactivateDid';
import './getDidForAddress';
import './checkDidActive';
import './resolveDid';
import './updatePublicKey';
