import { ethers } from 'hardhat';

interface IERC20Extended {
  decimals(): Promise<number>;
  symbol(): Promise<string>;
  transfer(to: string, amount: bigint): Promise<any>;
  balanceOf(account: string): Promise<bigint>;
}

async function main() {
  // Get environment variables
  const tokenAddress = '0x0165878A594ca255338adfa4d48449f69242Eb8F';
  const toAddress = '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f';
  let amount = '1000000';

  // Validate required parameters
  if (!tokenAddress || !toAddress) {
    console.error(`
Usage: TOKEN_ADDRESS=<token-address> TO_ADDRESS=<to-address> [AMOUNT=<amount>] npx hardhat run scripts/token/send-token.ts --network <network>

Example: 
TOKEN_ADDRESS=0x123...abc TO_ADDRESS=0x456...def AMOUNT=100 npx hardhat run scripts/token/send-token.ts --network localhost
`);
    process.exit(1);
  }

  try {
    // Get signer (deployer)
    const [deployer] = await ethers.getSigners();

    // Connect to the token contract
    const tokenContract = (await ethers.getContractAt(
      'ERC20', // Default ERC20 interface
      tokenAddress,
      deployer
    )) as unknown as IERC20Extended;

    // Get token details
    const decimals = Number(await tokenContract.decimals());
    const symbol = await tokenContract.symbol();

    // If amount not specified, use 1000
    if (!amount) {
      amount = '1000';
      console.log(`Amount not specified, using default: ${amount} ${symbol}`);
    }

    // Convert amount to proper decimal places
    const parsedAmount = ethers.parseUnits(amount, decimals);

    // Get deployer balance
    const deployerBalance = await tokenContract.balanceOf(deployer.address);

    // Check if deployer has enough balance
    if (deployerBalance < parsedAmount) {
      throw new Error(`Insufficient balance. Deployer has ${ethers.formatUnits(deployerBalance, decimals)} ${symbol}`);
    }

    // Send tokens
    console.log(`Sending ${amount} ${symbol} from ${deployer.address} to ${toAddress}...`);
    const tx = await tokenContract.transfer(toAddress, parsedAmount);

    console.log(`Transaction hash: ${tx.hash}`);
    console.log('Waiting for transaction to be mined...');

    // Wait for transaction confirmation
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block ${receipt?.blockNumber}`);

    // Get new balances
    const senderBalanceAfter = await tokenContract.balanceOf(deployer.address);
    const receiverBalanceAfter = await tokenContract.balanceOf(toAddress);

    console.log(`\nUpdated balances:`);
    console.log(`Sender (${deployer.address}): ${ethers.formatUnits(senderBalanceAfter, decimals)} ${symbol}`);
    console.log(`Receiver (${toAddress}): ${ethers.formatUnits(receiverBalanceAfter, decimals)} ${symbol}`);

    return receipt;
  } catch (error: any) {
    console.error('Error executing send-token script:');
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
