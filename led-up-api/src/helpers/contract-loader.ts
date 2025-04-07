import * as fs from 'fs';
import * as path from 'path';

/**
 * Cache for contract ABIs to avoid repeated file reads
 */
const abiCache: Record<string, any> = {};

/**
 * Loads a contract ABI from the artifacts directory
 *
 * @param contractName - The name of the contract
 * @returns The contract ABI
 * @throws Error if the contract ABI cannot be loaded
 */
export async function getContractABI(contractName: string): Promise<any> {
  // Return from cache if available
  if (abiCache[contractName]) {
    return abiCache[contractName];
  }

  try {
    // Determine the artifacts path - adjust as needed for your project structure
    const artifactsPath = process.env.ARTIFACTS_PATH || path.resolve(__dirname, '../../artifacts');

    // Try different possible file locations
    const possiblePaths = [
      path.join(artifactsPath, `${contractName}.json`),
      path.join(artifactsPath, contractName, `${contractName}.json`),
      path.join(artifactsPath, 'contracts', `${contractName}.json`),
      path.join(artifactsPath, 'contracts', contractName, `${contractName}.json`),
    ];

    let abiFile: string | null = null;

    for (const filePath of possiblePaths) {
      if (fs.existsSync(filePath)) {
        abiFile = filePath;
        break;
      }
    }

    if (!abiFile) {
      throw new Error(`ABI file for ${contractName} not found in artifacts directory`);
    }

    // Read and parse the ABI file
    const fileContent = await fs.promises.readFile(abiFile, 'utf8');
    const contractData = JSON.parse(fileContent);

    // Extract the ABI based on the file structure
    // Different build tools produce different JSON structures
    const abi =
      contractData.abi ||
      (contractData.compilerOutput && contractData.compilerOutput.abi) ||
      contractData;

    // Cache the ABI for future use
    abiCache[contractName] = abi;

    return abi;
  } catch (error) {
    throw new Error(
      `Failed to load ABI for ${contractName}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Loads a contract address from environment variables
 *
 * @param contractName - The name of the contract
 * @returns The contract address
 * @throws Error if the contract address is not configured
 */
export function getContractAddress(contractName: string): string {
  const envVarName = `${contractName.toUpperCase()}_CONTRACT_ADDRESS`;
  const address = process.env[envVarName];

  if (!address) {
    throw new Error(
      `Contract address for ${contractName} not configured. Set ${envVarName} environment variable.`
    );
  }

  return address;
}
