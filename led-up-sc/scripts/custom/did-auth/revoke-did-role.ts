import { ethers } from "hardhat";

// Helper function to convert role string to bytes32
async function getRoleHash(role: string, didAuthContract: any): Promise<string> {
  // If the role is already a bytes32 hash, return it
  if (role.startsWith('0x') && role.length === 66) {
    return role;
  }

  // Map string names to contract constants when possible
  try {
    switch(role.toUpperCase()) {
      case 'DEFAULT_ADMIN_ROLE':
        return await didAuthContract.DEFAULT_ADMIN_ROLE();
      case 'ADMIN':
        return await didAuthContract.ADMIN_ROLE();
      case 'OPERATOR':
        return await didAuthContract.OPERATOR_ROLE();
      case 'PRODUCER':
        return await didAuthContract.PRODUCER_ROLE();
      case 'CONSUMER':
        return await didAuthContract.CONSUMER_ROLE();
      case 'PROVIDER':
        return await didAuthContract.PROVIDER_ROLE();
      case 'ISSUER':
        return await didAuthContract.ISSUER_ROLE();
      case 'VERIFIER':
        return await didAuthContract.VERIFIER_ROLE();
      default:
        // If not a predefined role, hash the provided string using ethers
        return ethers.id(role);
    }
  } catch (error) {
    console.warn(`Warning: Could not get role hash from contract, using local computation instead`);
    
    // Check if the role matches any of our known roles and return a precalculated hash
    const roleKey = role.toUpperCase();
    switch(roleKey) {
      case 'DEFAULT_ADMIN_ROLE':
        return '0x0000000000000000000000000000000000000000000000000000000000000000';
      case 'ADMIN':
        return ethers.id('ADMIN');
      case 'OPERATOR':
        return ethers.id('OPERATOR');
      case 'PRODUCER':
        return ethers.id('PRODUCER');
      case 'CONSUMER':
        return ethers.id('CONSUMER');
      case 'PROVIDER':
        return ethers.id('PROVIDER');
      case 'ISSUER':
        return ethers.id('ISSUER');
      case 'VERIFIER':
        return ethers.id('VERIFIER');
      default:
        // If not a known role, compute the hash
        return ethers.id(role);
    }
  }
}

async function main() {
  // Get environment variables
  const didAuthAddress = process.env.CONTRACT_ADDRESS;
  const did = process.env.DID;
  const role = process.env.ROLE;

  // Validate required parameters
  if (!didAuthAddress || !did || !role) {
    console.error(`
Usage: CONTRACT_ADDRESS=<did-auth-address> DID=<did> ROLE=<role> npx hardhat run scripts/did-auth/revoke-did-role.ts --network <network>

Example: 
CONTRACT_ADDRESS=0x123...abc DID=did:example:123 ROLE=CONSUMER npx hardhat run scripts/did-auth/revoke-did-role.ts --network localhost
`);
    process.exit(1);
  }

  try {
    // Get signer (deployer)
    const [deployer] = await ethers.getSigners();
    
    // Connect to the DidAuth contract
    const didAuthContract = await ethers.getContractAt(
      'DidAuth', 
      didAuthAddress, 
      deployer
    );
    
    // Convert the role string to bytes32 - use the contract constants
    const roleHash = await getRoleHash(role, didAuthContract);
    
    // Validate the DID format (basic check)
    if (!did.startsWith('did:')) {
      throw new Error('Invalid DID format. DID should start with "did:"');
    }
    
    // Check if the caller has permission to revoke roles (owner check done in contract)
    console.log(`Revoking role '${role}' (${roleHash}) from DID: ${did}...`);
    const tx = await didAuthContract.revokeDidRole(did, roleHash);
    console.log(`Transaction sent. Waiting for confirmation...`);
    await tx.wait();
    
    console.log(`Successfully revoked role '${role}' from DID: ${did}`);
    console.log(`Transaction hash: ${tx.hash}`);
    console.log(`DidAuth contract address: ${didAuthAddress}`);
  } catch (error: any) {
    console.error('Error executing revoke-did-role script:');
    // Enhance error reporting
    if (error.reason) {
      console.error(`Reason: ${error.reason}`);
    } else if (error.message) {
      console.error(`Message: ${error.message}`);
    }
    process.exit(1);
  }
}

// Execute the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 
