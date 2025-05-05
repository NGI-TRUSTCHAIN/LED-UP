import { ethers } from "hardhat";

interface IERC20Extended {
  decimals(): Promise<number>;
  symbol(): Promise<string>;
  allowance(owner: string, spender: string): Promise<bigint>;
}

async function main() {
  // Get environment variables
  const tokenAddress = process.env.TOKEN_ADDRESS;
  const ownerAddress = process.env.OWNER;
  const spenderAddress = process.env.SPENDER;

  // Validate required parameters
  if (!tokenAddress || !ownerAddress || !spenderAddress) {
    console.error(`
Usage: TOKEN_ADDRESS=<token-address> OWNER=<owner-address> SPENDER=<spender-address> npx hardhat run scripts/token/token-allowance.ts --network <network>

Example: 
TOKEN_ADDRESS=0x123...abc OWNER=0x456...def SPENDER=0x789...ghi npx hardhat run scripts/token/token-allowance.ts --network localhost
`);
    process.exit(1);
  }

  try {
    // Get signer
    const [deployer] = await ethers.getSigners();
    
    // Connect to the token contract
    const tokenContract = await ethers.getContractAt(
      'ERC20', // Default ERC20 interface
      tokenAddress,
      deployer
    ) as unknown as IERC20Extended;
    
    // Get token details
    const decimals = await tokenContract.decimals();
    const symbol = await tokenContract.symbol();
    
    // Get allowance
    const allowanceAmount = await tokenContract.allowance(ownerAddress, spenderAddress);
    
    // Format the allowance with proper decimal places
    const formattedAllowance = ethers.formatUnits(allowanceAmount, decimals);
    
    console.log(`Token: ${symbol} (${tokenAddress})`);
    console.log(`Owner: ${ownerAddress}`);
    console.log(`Spender: ${spenderAddress}`);
    console.log(`Allowance: ${formattedAllowance} ${symbol}`);
    
    // Also return raw allowance for potential use in other scripts
    return {
      rawAllowance: allowanceAmount,
      formattedAllowance,
      symbol,
      decimals
    };
  } catch (error: any) {
    console.error('Error executing token-allowance script:');
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
