import { ethers } from "hardhat";

// Map of commonly used role hashes to readable names
const knownRoles: Record<string, string> = {
  // Will be populated during execution based on contract constants
};

async function main() {
  // Get environment variables
  const didAuthAddress = "0x9118EA4a52C6c7873729c8d8702cCd85E573f9E9";
  const did = "did:ethr:0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199";

  // Validate required parameters
  if (!didAuthAddress || !did) {
    console.error(`
Usage: CONTRACT_ADDRESS=<did-auth-address> DID=<did> npx hardhat run scripts/did-auth/get-did-roles.ts --network <network>

Example: 
CONTRACT_ADDRESS=0x123...abc DID=did:example:123 npx hardhat run scripts/did-auth/get-did-roles.ts --network localhost
`);
    process.exit(1);
  }

  try {
    // Get signer
    const [deployer] = await ethers.getSigners();
    
    // Connect to the DidAuth contract
    const didAuthContract = await ethers.getContractAt(
      'DidAuth', 
      didAuthAddress, 
      deployer
    ) as any; // Using any type to avoid TypeScript errors
    

    // Validate the DID format (basic check)
    if (!did.startsWith('did:')) {
      throw new Error('Invalid DID format. DID should start with "did:"');
    }
    
    // Populate known roles mapping
    try {
      const roleNames = [
        'DEFAULT_ADMIN_ROLE',
        'ADMIN_ROLE',
        'OPERATOR_ROLE',
        'PRODUCER_ROLE',
        'CONSUMER_ROLE',
        'PROVIDER_ROLE',
        'ISSUER_ROLE',
        'VERIFIER_ROLE'
      ];
      
      for (const roleName of roleNames) {
        try {
          const roleHash = await didAuthContract[roleName]();
          console.log(roleHash);
          knownRoles[roleHash] = roleName;
        } catch (e) {
          // Skip if role constant doesn't exist in contract
        }
      }
    } catch (error) {
      console.warn("Could not populate known roles from contract constants");
    }
    
    // Call the getUserRoles function (corrected from getDidRoles)
    const roles = await didAuthContract.getUserRoles(did);
    console.log(roles);
    
    console.log(`DID: ${did}`);
    console.log("Assigned Roles:");
    
    if (roles.length === 0) {
      console.log("  No roles assigned");
    } else {
      roles.forEach((roleHash: string, index: number) => {
        const roleName = knownRoles[roleHash] || `Custom Role ${index + 1}`;
        console.log(`  ${index + 1}. ${roleName} (${roleHash})`);
      });
    }
    
    // Return the roles for potential use in other scripts
    return roles;
  } catch (error: any) {
    console.error('Error executing get-did-roles script:');
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
