import { ethers } from "hardhat";

interface IERC20Extended {
  decimals(): Promise<number>;
  symbol(): Promise<string>;
  approve(spender: string, amount: bigint): Promise<any>;
  allowance(owner: string, spender: string): Promise<bigint>;
}

async function main() {
  // Get environment variables
  const tokenAddress = process.env.TOKEN_ADDRESS;
  const spenderAddress = process.env.SPENDER;
  const amount = process.env.AMOUNT;

  // Validate required parameters
  if (!tokenAddress || !spenderAddress || !amount) {
    console.error(`
Usage: TOKEN_ADDRESS=<token-address> SPENDER=<spender-address> AMOUNT=<amount> npx hardhat run scripts/token/token-approve.ts --network <network>

Example: 
TOKEN_ADDRESS=0x123...abc SPENDER=0x456...def AMOUNT=100 npx hardhat run scripts/token/token-approve.ts --network localhost
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
    
    // Convert amount to proper decimal places
    const parsedAmount = ethers.parseUnits(amount, decimals);
    
    // Check previous allowance
    const previousAllowance = await tokenContract.allowance(deployer.address, spenderAddress);
    console.log(`Previous allowance: ${ethers.formatUnits(previousAllowance, decimals)} ${symbol}`);
    
    // Approve tokens
    console.log(`Approving ${amount} ${symbol} for spender ${spenderAddress}...`);
    const tx = await tokenContract.approve(spenderAddress, parsedAmount);
    
    console.log(`Transaction hash: ${tx.hash}`);
    console.log('Waiting for transaction to be mined...');
    
    // Wait for transaction confirmation
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block ${receipt?.blockNumber}`);
    
    // Check new allowance
    const newAllowance = await tokenContract.allowance(deployer.address, spenderAddress);
    console.log(`\nNew allowance: ${ethers.formatUnits(newAllowance, decimals)} ${symbol}`);
    
    return receipt;
  } catch (error: any) {
    console.error('Error executing token-approve script:');
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
