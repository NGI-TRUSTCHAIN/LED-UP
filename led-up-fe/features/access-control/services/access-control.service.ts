'use client';

import { ethers } from 'ethers';
import { toast } from 'sonner';

// Types for permission management
export type Permission = {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  category: 'read' | 'write' | 'admin';
};

export type User = {
  id: string;
  did: string;
  name: string;
  email: string;
  permissions: string[];
};

export type Resource = {
  id: string;
  cid: string;
  name: string;
  description: string;
  owner: string;
  accessType: 'public' | 'private' | 'restricted';
  permissions: {
    userId: string;
    permissionIds: string[];
  }[];
};

/**
 * Service for managing access control operations
 */
export class AccessControlService {
  private contractAddress: string;
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;

  constructor(contractAddress: string) {
    this.contractAddress = contractAddress;
    this.initializeProvider();
  }

  /**
   * Initialize the Ethereum provider
   */
  private async initializeProvider() {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        this.provider = new ethers.BrowserProvider(window.ethereum);
        this.signer = await this.provider.getSigner();
      } catch (error) {
        console.error('User denied account access', error);
        toast.error('Wallet Connection Error', {
          description: 'Please connect your wallet to use this application.',
        });
      }
    } else {
      console.error('No Ethereum provider detected');
      toast.error('No Wallet Detected', {
        description: 'Please install MetaMask or another Web3 wallet to use this application.',
      });
    }
  }

  /**
   * Get a list of all users with access permissions
   */
  async getUsers(): Promise<User[]> {
    try {
      // This would be an API call to get users from the backend
      // For now, returning mock data
      return [
        { id: 'u1', did: 'did:ethr:0x123...', name: 'Alice', email: 'alice@example.com', permissions: ['p1', 'p2'] },
        { id: 'u2', did: 'did:ethr:0x456...', name: 'Bob', email: 'bob@example.com', permissions: ['p1'] },
        {
          id: 'u3',
          did: 'did:ethr:0x789...',
          name: 'Carol',
          email: 'carol@example.com',
          permissions: ['p1', 'p3', 'p4'],
        },
      ];
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error fetching users. Please try again later.', {
        description: 'Failed to fetch users. Please try again later.',
      });
      return [];
    }
  }

  /**
   * Get a list of all resources
   */
  async getResources(): Promise<Resource[]> {
    try {
      // This would be an API call to get resources from the backend/smart contract
      // For now, returning mock data
      return [
        {
          id: 'r1',
          cid: 'Qm123...',
          name: 'Patient Data 1',
          description: 'Contains patient records',
          owner: 'u1',
          accessType: 'restricted',
          permissions: [
            { userId: 'u1', permissionIds: ['p1', 'p2', 'p3', 'p4'] },
            { userId: 'u2', permissionIds: ['p1'] },
          ],
        },
        {
          id: 'r2',
          cid: 'Qm456...',
          name: 'Research Data',
          description: 'Contains research findings',
          owner: 'u3',
          accessType: 'public',
          permissions: [
            { userId: 'u3', permissionIds: ['p1', 'p2', 'p3', 'p4'] },
            { userId: 'u1', permissionIds: ['p1', 'p2'] },
            { userId: 'u2', permissionIds: ['p1'] },
          ],
        },
      ];
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast.error('Error fetching resources. Please try again later.');
      return [];
    }
  }

  /**
   * Get a list of all permission types
   */
  async getPermissions(): Promise<Permission[]> {
    try {
      // This would be an API call to get permissions from the backend
      // For now, returning mock data
      return [
        { id: 'p1', name: 'View Data', description: 'Can view data', isEnabled: true, category: 'read' },
        { id: 'p2', name: 'Download Data', description: 'Can download data', isEnabled: true, category: 'read' },
        { id: 'p3', name: 'Edit Data', description: 'Can edit data', isEnabled: true, category: 'write' },
        { id: 'p4', name: 'Delete Data', description: 'Can delete data', isEnabled: true, category: 'write' },
        { id: 'p5', name: 'Manage Users', description: 'Can manage users', isEnabled: true, category: 'admin' },
      ];
    } catch (error) {
      console.error('Error fetching permissions:', error);
      toast.error('Error fetching permissions. Please try again later.');
      return [];
    }
  }

  /**
   * Update a user's permissions
   */
  async updateUserPermissions(userId: string, permissionIds: string[]): Promise<boolean> {
    try {
      // This would be a transaction to update user permissions in the smart contract
      console.log(`Updating permissions for user ${userId} to: ${permissionIds.join(', ')}`);

      // Mock successful update
      return true;
    } catch (error) {
      console.error('Error updating user permissions:', error);
      toast.error('Error', {
        description: 'Failed to update user permissions. Please try again.',
      });
      return false;
    }
  }

  /**
   * Update resource permissions for a specific user
   */
  async updateResourcePermissions(resourceId: string, userId: string, permissionIds: string[]): Promise<boolean> {
    try {
      // This would be a transaction to update resource permissions in the smart contract
      console.log(`Updating permissions for resource ${resourceId}, user ${userId} to: ${permissionIds.join(', ')}`);

      // Mock successful update
      return true;
    } catch (error) {
      console.error('Error updating resource permissions:', error);
      toast.error('Error', {
        description: 'Failed to update resource permissions. Please try again.',
      });
      return false;
    }
  }

  /**
   * Create a new permission type
   */
  async createPermission(permission: Omit<Permission, 'id'>): Promise<string | null> {
    try {
      // This would be a transaction to create a new permission type in the smart contract
      console.log(`Creating new permission: ${permission.name}`);

      // Mock successful creation with a new ID
      const newId = `p${Date.now()}`;
      return newId;
    } catch (error) {
      console.error('Error creating permission:', error);
      toast.error('Error', {
        description: 'Failed to create permission. Please try again.',
      });
      return null;
    }
  }

  /**
   * Update resource access type
   */
  async updateResourceAccessType(
    resourceId: string,
    accessType: 'public' | 'private' | 'restricted'
  ): Promise<boolean> {
    try {
      // This would be a transaction to update resource access type in the smart contract
      console.log(`Updating access type for resource ${resourceId} to: ${accessType}`);

      // Mock successful update
      return true;
    } catch (error) {
      console.error('Error updating resource access type:', error);
      toast.error('Error', {
        description: 'Failed to update resource access type. Please try again.',
      });
      return false;
    }
  }
}

// Create a singleton instance for use throughout the application
export const accessControlService = new AccessControlService(
  process.env.NEXT_PUBLIC_ACCESS_CONTROL_CONTRACT_ADDRESS || ''
);

export default accessControlService;
