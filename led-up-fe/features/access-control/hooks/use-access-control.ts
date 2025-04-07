'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import accessControlService, { Permission, User, Resource } from '../services/access-control.service';

/**
 * Custom hook for managing access control functionality
 */
export function useAccessControl() {
  const [users, setUsers] = useState<User[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Initialize data
   */
  const initialize = useCallback(async () => {
    if (isInitialized) return;

    setIsLoading(true);
    try {
      const [usersData, resourcesData, permissionsData] = await Promise.all([
        accessControlService.getUsers(),
        accessControlService.getResources(),
        accessControlService.getPermissions(),
      ]);

      setUsers(usersData);
      setResources(resourcesData);
      setPermissions(permissionsData);
      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing access control data:', error);
      toast.error('Error', {
        description: 'Failed to load access control data. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  // Initialize data on first load
  useEffect(() => {
    initialize();
  }, [initialize]);

  /**
   * Update user permissions
   */
  const updateUserPermissions = async (userId: string, permissionIds: string[]) => {
    setIsLoading(true);
    try {
      const success = await accessControlService.updateUserPermissions(userId, permissionIds);

      if (success) {
        // Update local state
        setUsers(
          users.map((user) => {
            if (user.id === userId) {
              return {
                ...user,
                permissions: permissionIds,
              };
            }
            return user;
          })
        );

        toast.success('User permissions have been updated successfully.');
      }

      return success;
    } catch (error) {
      console.error('Error updating user permissions:', error);
      toast.error('Error', {
        description: 'Failed to update user permissions. Please try again.',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update resource permissions for a specific user
   */
  const updateResourcePermissions = async (resourceId: string, userId: string, permissionIds: string[]) => {
    setIsLoading(true);
    try {
      const success = await accessControlService.updateResourcePermissions(resourceId, userId, permissionIds);

      if (success) {
        // Update local state
        setResources(
          resources.map((resource) => {
            if (resource.id === resourceId) {
              const existingPermIndex = resource.permissions.findIndex((perm) => perm.userId === userId);

              let updatedPermissions = [...resource.permissions];

              if (existingPermIndex >= 0) {
                if (permissionIds.length === 0) {
                  // Remove user if no permissions left
                  updatedPermissions = updatedPermissions.filter((perm) => perm.userId !== userId);
                } else {
                  // Update existing permissions
                  updatedPermissions[existingPermIndex] = {
                    userId,
                    permissionIds,
                  };
                }
              } else if (permissionIds.length > 0) {
                // Add new permissions
                updatedPermissions.push({
                  userId,
                  permissionIds,
                });
              }

              return {
                ...resource,
                permissions: updatedPermissions,
              };
            }
            return resource;
          })
        );

        toast.success('Resource permissions have been updated successfully.');
      }

      return success;
    } catch (error) {
      console.error('Error updating resource permissions:', error);
      toast.error('Error', {
        description: 'Failed to update resource permissions. Please try again.',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Create new permission
   */
  const createPermission = async (permission: Omit<Permission, 'id'>) => {
    setIsLoading(true);
    try {
      const newId = await accessControlService.createPermission(permission);

      if (newId) {
        // Update local state
        const newPermission: Permission = {
          ...permission,
          id: newId,
        };

        setPermissions([...permissions, newPermission]);

        toast.success('New permission has been created successfully.');
      }

      return newId;
    } catch (error) {
      console.error('Error creating permission:', error);
      toast.error('Error', {
        description: 'Failed to create permission. Please try again.',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update resource access type
   */
  const updateResourceAccessType = async (resourceId: string, accessType: 'public' | 'private' | 'restricted') => {
    setIsLoading(true);
    try {
      const success = await accessControlService.updateResourceAccessType(resourceId, accessType);

      if (success) {
        // Update local state
        setResources(
          resources.map((resource) => {
            if (resource.id === resourceId) {
              return {
                ...resource,
                accessType,
              };
            }
            return resource;
          })
        );

        toast.success(`Resource access type has been changed to ${accessType}.`);
      }

      return success;
    } catch (error) {
      console.error('Error updating resource access type:', error);
      toast.error('Error', {
        description: 'Failed to update resource access type. Please try again.',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    users,
    resources,
    permissions,
    isLoading,
    isInitialized,
    updateUserPermissions,
    updateResourcePermissions,
    createPermission,
    updateResourceAccessType,
    initialize,
  };
}

export default useAccessControl;
