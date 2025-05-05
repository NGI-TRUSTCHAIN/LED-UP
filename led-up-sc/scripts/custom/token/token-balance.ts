import { ethers } from "hardhat";

interface IERC20Extended {
  decimals(): Promise<number>;
  symbol(): Promise<string>;
  balanceOf(account: string): Promise<bigint>;
}

async function main() {
  // Get environment variables
  const tokenAddress = process.env.TOKEN_ADDRESS;
  const accountAddress = process.env.ACCOUNT;

  // Validate required parameters
  if (!tokenAddress || !accountAddress) {
    console.error(`
Usage: TOKEN_ADDRESS=<token-address> ACCOUNT=<account-address> npx hardhat run scripts/token/token-balance.ts --network <network>

Example: 
TOKEN_ADDRESS=0x123...abc ACCOUNT=0x456...def npx hardhat run scripts/token/token-balance.ts --network localhost
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
    
    // Get account balance
    const balance = await tokenContract.balanceOf(accountAddress);
    
    // Format the balance with proper decimal places
    const formattedBalance = ethers.formatUnits(balance, decimals);
    
    console.log(`Token: ${symbol} (${tokenAddress})`);
    console.log(`Account: ${accountAddress}`);
    console.log(`Balance: ${formattedBalance} ${symbol}`);
    
    // Also return raw balance for potential use in other scripts
    return {
      rawBalance: balance,
      formattedBalance,
      symbol,
      decimals
    };
  } catch (error: any) {
    console.error('Error executing token-balance script:');
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
