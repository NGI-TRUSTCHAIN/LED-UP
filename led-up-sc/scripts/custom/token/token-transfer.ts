import { ethers } from "hardhat";

interface IERC20Extended {
  decimals(): Promise<number>;
  symbol(): Promise<string>;
  transfer(to: string, amount: bigint): Promise<any>;
  balanceOf(account: string): Promise<bigint>;
}

async function main() {
  // Get environment variables
  const tokenAddress = process.env.TOKEN_ADDRESS;
  const recipientAddress = process.env.TO_ADDRESS;
  const amount = process.env.AMOUNT;

  // Validate required parameters
  if (!tokenAddress || !recipientAddress || !amount) {
    console.error(`
Usage: TOKEN_ADDRESS=<token-address> TO_ADDRESS=<recipient-address> AMOUNT=<amount> npx hardhat run scripts/token/token-transfer.ts --network <network>

Example: 
TOKEN_ADDRESS=0x123...abc TO_ADDRESS=0x456...def AMOUNT=100 npx hardhat run scripts/token/token-transfer.ts --network localhost
`);
    process.exit(1);
  }

  try {
    // Get signer
    const [signer] = await ethers.getSigners();
    
    // Connect to the token contract
    const tokenContract = await ethers.getContractAt(
      'ERC20', // Default ERC20 interface
      tokenAddress,
      signer
    ) as unknown as IERC20Extended;
    
    // Get token details
    const decimals = await tokenContract.decimals();
    const symbol = await tokenContract.symbol();
    
    // Convert amount to proper decimal places
    const parsedAmount = ethers.parseUnits(amount, decimals);
    
    // Get sender balance
    const senderBalance = await tokenContract.balanceOf(signer.address);
    
    // Check if sender has enough balance
    if (senderBalance < parsedAmount) {
      throw new Error(`Insufficient balance. You have ${ethers.formatUnits(senderBalance, decimals)} ${symbol}`);
    }
    
    // Send tokens
    console.log(`Sending ${amount} ${symbol} from ${signer.address} to ${recipientAddress}...`);
    const tx = await tokenContract.transfer(recipientAddress, parsedAmount);
    
    console.log(`Transaction hash: ${tx.hash}`);
    console.log('Waiting for transaction to be mined...');
    
    // Wait for transaction confirmation
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block ${receipt?.blockNumber}`);
    
    // Get new balances
    const senderBalanceAfter = await tokenContract.balanceOf(signer.address);
    const recipientBalanceAfter = await tokenContract.balanceOf(recipientAddress);
    
    console.log(`\nUpdated balances:`);
    console.log(`Sender (${signer.address}): ${ethers.formatUnits(senderBalanceAfter, decimals)} ${symbol}`);
    console.log(`Recipient (${recipientAddress}): ${ethers.formatUnits(recipientBalanceAfter, decimals)} ${symbol}`);
    
    return receipt;
  } catch (error: any) {
    console.error('Error executing token-transfer script:');
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
