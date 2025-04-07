// import { AccessGrant, AccessGrantInput } from '../../models';
// import { BlockchainService } from '../contracts';
// import { DatabaseService } from '../db';

// /**
//  * Service for managing access grants
//  * Integrates blockchain data with database storage
//  */
// export class AccessGrantService {
//   private blockchainService: BlockchainService;
//   private databaseService: DatabaseService;

//   /**
//    * Create a new access grant service
//    * @param blockchainService The blockchain service instance
//    * @param databaseService The database service instance
//    */
//   constructor(blockchainService: BlockchainService, databaseService: DatabaseService) {
//     this.blockchainService = blockchainService;
//     this.databaseService = databaseService;
//   }

//   /**
//    * Process a blockchain payment event and store it in the database
//    * @param userAddress The user's blockchain address
//    * @param dataId The ID of the data being accessed
//    * @param transactionHash The blockchain transaction hash
//    * @param paymentAmount The amount paid (in wei)
//    * @returns The created access grant
//    */
//   async processPayment(
//     userAddress: string,
//     dataId: string,
//     transactionHash?: string,
//     paymentAmount?: string
//   ): Promise<AccessGrant> {
//     // Verify the payment on the blockchain
//     const hasAccess = await this.blockchainService.verifyAccess(userAddress, dataId);

//     if (!hasAccess) {
//       throw new Error('Payment verification failed. No access found on blockchain.');
//     }

//     // Calculate expiration (15 days from now)
//     const expiresAt = new Date();
//     expiresAt.setDate(expiresAt.getDate() + 15);

//     // Create the access grant in the database
//     const accessGrantInput: AccessGrantInput = {
//       userAddress,
//       dataId,
//       expiresAt,
//       transactionHash,
//       paymentAmount,
//     };

//     return await this.databaseService.createAccessGrant(accessGrantInput);
//   }

//   /**
//    * Verify if a user has access to a data item
//    * Checks both the blockchain and the database
//    * @param userAddress The user's blockchain address
//    * @param dataId The ID of the data being accessed
//    * @returns True if the user has access, false otherwise
//    */
//   async verifyAccess(userAddress: string, dataId: string): Promise<boolean> {
//     // First check the blockchain
//     const blockchainAccess = await this.blockchainService.verifyAccess(userAddress, dataId);

//     if (!blockchainAccess) {
//       return false;
//     }

//     // Then check the database for additional constraints (like expiration)
//     return await this.databaseService.checkAccess(userAddress, dataId);
//   }

//   /**
//    * Get all access grants for a user
//    * @param userAddress The user's blockchain address
//    * @returns An array of access grants
//    */
//   async getUserAccessGrants(userAddress: string): Promise<AccessGrant[]> {
//     return await this.databaseService.getAccessGrantsByUser(userAddress);
//   }

//   /**
//    * Revoke access to a data item
//    * @param grantId The ID of the access grant to revoke
//    * @returns True if successful, false otherwise
//    */
//   async revokeAccess(grantId: string): Promise<boolean> {
//     return await this.databaseService.revokeAccessGrant(grantId);
//   }

//   /**
//    * Process a blockchain event for handling access grants
//    * @param eventType The type of blockchain event
//    * @param userAddress The user's blockchain address
//    * @param dataId The ID of the data
//    * @param transactionHash The transaction hash
//    * @param paymentAmount The payment amount (if applicable)
//    */
//   async processBlockchainEvent(
//     eventType: 'PaymentReceived' | 'AccessRevoked',
//     userAddress: string,
//     dataId: string,
//     transactionHash?: string,
//     paymentAmount?: string
//   ): Promise<void> {
//     switch (eventType) {
//       case 'PaymentReceived':
//         await this.processPayment(userAddress, dataId, transactionHash, paymentAmount);
//         break;

//       case 'AccessRevoked':
//         // Find the access grant by user and data ID
//         const grants = await this.databaseService.getAccessGrantsByData(dataId);

//         const grantToRevoke = grants.find(
//           g => g.userAddress.toLowerCase() === userAddress.toLowerCase() && !g.revoked
//         );

//         if (grantToRevoke) {
//           await this.databaseService.revokeAccessGrant(grantToRevoke.id);
//         }
//         break;
//     }
//   }
// }
