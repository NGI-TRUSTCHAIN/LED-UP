'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAccessControl } from '../hooks/use-access-control';
import { Eye, Pencil, Shield, ShieldCheck } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';
import { Loader2, Plus } from 'lucide-react';
import { Search, Users, FileText } from 'lucide-react';

export const EnhancedPermissionDashboard = () => {
  const {
    users,
    resources,
    permissions,
    isLoading,
    isInitialized,
    initialize,
    updateUserPermissions,
    updateResourcePermissions,
    updateResourceAccessType,
    createPermission,
  } = useAccessControl();

  const [activeTab, setActiveTab] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const [newPermission, setNewPermission] = useState({
    name: '',
    category: 'read' as 'read' | 'write' | 'admin',
    description: '',
    isEnabled: true,
  });

  // Add a CSS class for skeleton pulse animation
  const skeletonClass = 'animate-pulse bg-slate-200 dark:bg-slate-700 rounded';

  useEffect(() => {
    const loadData = async () => {
      try {
        await initialize();
      } catch (error) {
        console.error('Error initializing access control data:', error);
        toast.error('Failed to load data', {
          description: 'There was a problem loading the access control data. Please refresh the page.',
          action: {
            label: 'Retry',
            onClick: () => initialize(),
          },
        });
      }
    };

    if (!isInitialized) {
      loadData();
    }
  }, [initialize, isInitialized]);

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.did.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter resources based on search query
  const filteredResources = resources.filter(
    (resource) =>
      resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.cid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Update the loading state render with better animations
  if (!isInitialized) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`h-8 w-48 ${skeletonClass}`}></h2>
            <p className={`h-4 w-96 mt-2 ${skeletonClass}`}></p>
          </div>
          <div className={`h-10 w-32 ${skeletonClass}`}></div>
        </div>

        <div className={`h-12 w-full rounded-lg ${skeletonClass}`}></div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className={`h-6 w-48 ${skeletonClass}`}></div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={`h-16 w-full ${skeletonClass}`}></div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className={`h-6 w-48 ${skeletonClass}`}></div>
            <div className={`h-72 w-full rounded-lg ${skeletonClass}`}></div>
          </div>
        </div>
      </div>
    );
  }

  // Handler for updating resource permissions
  const handleResourcePermissionUpdate = async (resourceId: string, userId: string, permissionIds: string[]) => {
    try {
      await updateResourcePermissions(resourceId, userId, permissionIds);
      toast.success('Permissions updated', {
        description: 'Resource permissions have been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating resource permissions:', error);
      toast.error('Failed to update permissions', {
        description: 'There was a problem updating the resource permissions. Please try again.',
        action: {
          label: 'Retry',
          onClick: () => handleResourcePermissionUpdate(resourceId, userId, permissionIds),
        },
      });
    }
  };

  // Handler for updating resource access type
  const handleResourceAccessTypeUpdate = async (
    resourceId: string,
    accessType: 'public' | 'private' | 'restricted'
  ) => {
    try {
      await updateResourceAccessType(resourceId, accessType);
      toast.success('Access type updated', {
        description: `Resource access type has been changed to ${accessType} successfully.`,
        icon: accessType === 'public' ? '🌐' : accessType === 'private' ? '🔒' : '🔐',
      });
    } catch (error) {
      console.error('Error updating resource access type:', error);
      toast.error('Failed to update access type', {
        description: `Could not change access type to ${accessType}. Please try again.`,
        action: {
          label: 'Retry',
          onClick: () => handleResourceAccessTypeUpdate(resourceId, accessType),
        },
      });
    }
  };

  // Handler for updating user permissions
  const handleUserPermissionUpdate = async (userId: string, permissionIds: string[]) => {
    try {
      await updateUserPermissions(userId, permissionIds);
      toast.success('Permissions updated', {
        description: 'User permissions have been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating user permissions:', error);
      toast.error('Failed to update permissions', {
        description: 'There was a problem updating the user permissions. Please try again.',
        action: {
          label: 'Retry',
          onClick: () => handleUserPermissionUpdate(userId, permissionIds),
        },
      });
    }
  };

  // Handler for creating a new permission
  const handleCreatePermission = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPermission.name || !newPermission.category || !newPermission.description) {
      toast.error('Invalid permission', {
        description: 'Please fill in all required fields.',
      });
      return;
    }

    try {
      await createPermission(newPermission);
      toast.success('Permission created', {
        description: `${newPermission.name} permission has been created successfully.`,
        icon: newPermission.category === 'read' ? '👁️' : newPermission.category === 'write' ? '✏️' : '🛡️',
      });

      // Reset form
      setNewPermission({
        name: '',
        category: 'read' as 'read' | 'write' | 'admin',
        description: '',
        isEnabled: true,
      });
    } catch (error) {
      console.error('Error creating permission:', error);
      toast.error('Failed to create permission', {
        description: 'There was a problem creating the new permission. Please try again.',
        action: {
          label: 'Retry',
          onClick: () => handleCreatePermission(e),
        },
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search users, resources or permissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 transition-all focus-within:ring-2 focus-within:ring-primary/30"
          />
        </div>

        <Button
          onClick={() => setActiveTab('permissions')}
          variant="default"
          size="sm"
          className="sm:w-auto w-full hover:shadow-md transition-all gap-1"
        >
          <Plus className="h-4 w-4" />
          Add Permission
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b mb-6">
          <TabsList className="bg-transparent h-12 p-0">
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-12 px-6 transition-all"
              onClick={() => setActiveTab('users')}
            >
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger
              value="resources"
              className="data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-12 px-6 transition-all"
              onClick={() => setActiveTab('resources')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Resources
            </TabsTrigger>
            <TabsTrigger
              value="permissions"
              className="data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-12 px-6 transition-all"
              onClick={() => setActiveTab('permissions')}
            >
              <ShieldCheck className="h-4 w-4 mr-2" />
              Permissions
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-1">
              <CardTitle className="text-xl flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                User Permissions
              </CardTitle>
              <CardDescription>Manage access permissions for individual users across all resources</CardDescription>
            </CardHeader>
            <CardContent className="px-1">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Users List */}
                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <span className="bg-primary/10 text-primary p-1 rounded">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </span>
                    Users
                  </h3>
                  <div className="border rounded-md max-h-[500px] overflow-y-auto bg-background dark:bg-gray-900 shadow-sm">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted dark:bg-gray-800">
                          <TableHead>Name</TableHead>
                          <TableHead>DID</TableHead>
                          <TableHead>Permissions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow
                            key={user.id}
                            className={`${
                              selectedUser === user.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                            } cursor-pointer hover:bg-muted dark:hover:bg-gray-800 transition-colors`}
                            onClick={() => setSelectedUser(user.id)}
                          >
                            <TableCell className="font-medium flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              {user.name}
                            </TableCell>
                            <TableCell className="truncate max-w-[150px] text-muted-foreground">{user.did}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                                {user.permissions.length} permissions
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* User Details */}
                {selectedUser ? (
                  <Card className="rounded-sm px-5 py-3">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <span className="bg-primary/10 text-primary p-1 rounded">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </span>
                      User Details
                    </h3>
                    {users
                      .filter((user) => user.id === selectedUser)
                      .map((user) => (
                        <div
                          key={user.id}
                          className="space-y-4 bg-background dark:bg-gray-900 p-4 rounded-lg shadow-sm"
                        >
                          <div className="flex items-center gap-3 pb-3 border-b">
                            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-lg font-medium">{user.name}</h4>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-3">
                            <div>
                              <Label className="text-xs text-muted-foreground">DID Identifier</Label>
                              <div className="flex items-center bg-muted dark:bg-gray-800 p-2 rounded text-sm font-mono">
                                {user.did}
                              </div>
                            </div>
                          </div>

                          <div>
                            <Label className="mb-2 block text-xs text-muted-foreground">Permission Access</Label>
                            <div className="space-y-2 border rounded-md p-4 bg-muted dark:bg-gray-800 divide-y">
                              {permissions.map((permission) => (
                                <div
                                  key={permission.id}
                                  className="flex items-center justify-between py-2 first:pt-0 last:pb-0"
                                >
                                  <div className="flex items-center gap-2">
                                    <Checkbox
                                      id={`user-${user.id}-permission-${permission.id}`}
                                      checked={user.permissions.includes(permission.id)}
                                      disabled={isLoading}
                                      onCheckedChange={(checked) => {
                                        const newPermissions = checked
                                          ? [...user.permissions, permission.id]
                                          : user.permissions.filter((p) => p !== permission.id);

                                        handleUserPermissionUpdate(user.id, newPermissions);
                                      }}
                                      className="h-4 w-4 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                    />
                                    <div>
                                      <Label
                                        htmlFor={`user-${user.id}-permission-${permission.id}`}
                                        className="text-sm font-medium cursor-pointer flex items-center gap-1"
                                      >
                                        {permission.category === 'read' && (
                                          <Eye className="h-3.5 w-3.5 text-blue-500" />
                                        )}
                                        {permission.category === 'write' && (
                                          <Pencil className="h-3.5 w-3.5 text-amber-500" />
                                        )}
                                        {permission.category === 'admin' && (
                                          <ShieldCheck className="h-3.5 w-3.5 text-purple-500" />
                                        )}
                                        {permission.name}
                                      </Label>
                                    </div>
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${
                                      permission.category === 'read'
                                        ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
                                        : permission.category === 'write'
                                        ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                                        : 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20'
                                    }`}
                                  >
                                    {permission.category}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <Button variant="outline" onClick={() => setSelectedUser(null)} className="text-sm">
                              Close
                            </Button>
                          </div>
                        </div>
                      ))}
                  </Card>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center p-6 bg-muted dark:bg-gray-800 rounded-lg">
                      <div className="w-12 h-12 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-primary"
                        >
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium mb-1">No User Selected</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Select a user from the list to view and manage their permissions
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources">
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-1">
              <CardTitle className="text-xl flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <line x1="10" y1="9" x2="8" y2="9" />
                </svg>
                Resource Permissions
              </CardTitle>
              <CardDescription>
                Manage who can access specific resources and what actions they can perform
              </CardDescription>
            </CardHeader>
            <CardContent className="px-1">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Resources List */}
                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <span className="bg-primary/10 text-primary p-1 rounded">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                        <polyline points="13 2 13 9 20 9" />
                      </svg>
                    </span>
                    Resources
                  </h3>
                  <div className="border rounded-md max-h-[500px] overflow-y-auto bg-background dark:bg-gray-900 shadow-sm">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted dark:bg-gray-800">
                          <TableHead>Name</TableHead>
                          <TableHead>Access Type</TableHead>
                          <TableHead>Users</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredResources.map((resource) => (
                          <TableRow
                            key={resource.id}
                            className={`${
                              selectedResource === resource.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                            } cursor-pointer hover:bg-muted dark:hover:bg-gray-800 transition-colors`}
                            onClick={() => setSelectedResource(resource.id)}
                          >
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="15"
                                    height="15"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                  </svg>
                                </div>
                                {resource.name}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`
                                  ${
                                    resource.accessType === 'public'
                                      ? 'bg-green-50 text-green-700 hover:bg-green-50 dark:bg-green-500/10 dark:text-green-400'
                                      : resource.accessType === 'private'
                                      ? 'bg-red-50 text-red-700 hover:bg-red-50 dark:bg-red-500/10 dark:text-red-400'
                                      : 'bg-blue-50 text-blue-700 hover:bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400'
                                  }
                                `}
                              >
                                {resource.accessType}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex -space-x-2">
                                {resource.permissions.slice(0, 3).map((perm, idx) => {
                                  const user = users.find((u) => u.id === perm.userId);
                                  return (
                                    <div
                                      key={perm.userId}
                                      className="w-7 h-7 rounded-full bg-muted dark:bg-gray-700 flex items-center justify-center border-2 border-white dark:border-gray-900 text-xs font-medium"
                                      title={user?.name}
                                    >
                                      {user?.name.charAt(0).toUpperCase()}
                                    </div>
                                  );
                                })}
                                {resource.permissions.length > 3 && (
                                  <div className="w-7 h-7 rounded-full bg-muted dark:bg-gray-800 flex items-center justify-center border-2 dark:border-gray-900 text-xs">
                                    +{resource.permissions.length - 3}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Resource Details */}
                {selectedResource ? (
                  <Card className="rounded-sm px-5 py-3">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <span className="bg-primary/10 text-primary p-1 rounded">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7l-5-5z" />
                          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                        </svg>
                      </span>
                      Resource Details
                    </h3>
                    {resources
                      .filter((resource) => resource.id === selectedResource)
                      .map((resource) => (
                        <div
                          key={resource.id}
                          className="space-y-4 bg-background dark:bg-gray-900 p-4 rounded-lg shadow-sm"
                        >
                          <div className="flex items-center gap-3 pb-3 border-b">
                            <div className="w-12 h-12 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="text-lg font-medium">{resource.name}</h4>
                              <p className="text-sm text-muted-foreground truncate max-w-xs">{resource.cid}</p>
                            </div>
                          </div>

                          <div>
                            <Label className="text-xs text-muted-foreground">Description</Label>
                            <div className="bg-muted dark:bg-gray-800 p-3 rounded text-sm mt-1">
                              {resource.description}
                            </div>
                          </div>

                          <div>
                            <Label className="text-xs text-muted-foreground mb-2 block">Access Type</Label>
                            <div className="flex bg-muted dark:bg-gray-800 p-3 rounded gap-4">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id="access-public"
                                  name="access-type"
                                  value="public"
                                  aria-label="Public access type"
                                  checked={resource.accessType === 'public'}
                                  disabled={isLoading}
                                  onChange={() => {
                                    handleResourceAccessTypeUpdate(resource.id, 'public');
                                  }}
                                  className="text-green-600 focus:ring-green-500"
                                />
                                <Label htmlFor="access-public" className="flex items-center gap-1 cursor-pointer">
                                  <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                                  Public
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id="access-private"
                                  name="access-type"
                                  value="private"
                                  aria-label="Private access type"
                                  checked={resource.accessType === 'private'}
                                  disabled={isLoading}
                                  onChange={() => {
                                    handleResourceAccessTypeUpdate(resource.id, 'private');
                                  }}
                                  className="text-red-600 focus:ring-red-500"
                                />
                                <Label htmlFor="access-private" className="flex items-center gap-1 cursor-pointer">
                                  <span className="inline-block w-3 h-3 bg-red-500 rounded-full"></span>
                                  Private
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id="access-restricted"
                                  name="access-type"
                                  value="restricted"
                                  aria-label="Restricted access type"
                                  checked={resource.accessType === 'restricted'}
                                  disabled={isLoading}
                                  onChange={() => {
                                    handleResourceAccessTypeUpdate(resource.id, 'restricted');
                                  }}
                                  className="text-blue-600 focus:ring-blue-500"
                                />
                                <Label htmlFor="access-restricted" className="flex items-center gap-1 cursor-pointer">
                                  <span className="inline-block w-3 h-3 bg-blue-500 rounded-full"></span>
                                  Restricted
                                </Label>
                              </div>
                            </div>
                          </div>

                          <div>
                            <Label className="text-xs text-muted-foreground mb-2 block">User Access</Label>
                            <div className="space-y-3 border rounded-md p-4 max-h-[300px] overflow-y-auto bg-muted dark:bg-gray-800 divide-y">
                              {users.map((user) => {
                                const userPermission = resource.permissions.find((perm) => perm.userId === user.id);
                                const userPermissionIds = userPermission ? userPermission.permissionIds : [];

                                return (
                                  <div key={user.id} className="pt-3 first:pt-0">
                                    <div className="flex justify-between items-center mb-2">
                                      <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                                          {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-medium text-sm">{user.name}</span>
                                      </div>
                                      <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                                        {user.did}
                                      </span>
                                    </div>
                                    <div className="space-y-2 pl-9">
                                      <div className="grid grid-cols-2 gap-2">
                                        {permissions
                                          .filter((permission) => permission.category !== 'admin')
                                          .map((permission) => (
                                            <div
                                              key={permission.id}
                                              className="flex items-center space-x-2 px-3 py-2 bg-background dark:bg-gray-900 p-1.5 rounded border dark:border-gray-700"
                                            >
                                              <Checkbox
                                                id={`resource-${resource.id}-user-${user.id}-permission-${permission.id}`}
                                                checked={userPermissionIds.includes(permission.id)}
                                                disabled={isLoading}
                                                onCheckedChange={(checked) => {
                                                  const newPermissionIds = checked
                                                    ? [...userPermissionIds, permission.id]
                                                    : userPermissionIds.filter((p) => p !== permission.id);

                                                  handleResourcePermissionUpdate(
                                                    resource.id,
                                                    user.id,
                                                    newPermissionIds
                                                  );
                                                }}
                                                className="h-4 w-4"
                                              />
                                              <Label
                                                htmlFor={`resource-${resource.id}-user-${user.id}-permission-${permission.id}`}
                                                className="text-xs cursor-pointer flex items-center gap-1"
                                              >
                                                {permission.category === 'read' && (
                                                  <Eye className="h-3 w-3 text-blue-500" />
                                                )}
                                                {permission.category === 'write' && (
                                                  <Pencil className="h-3 w-3 text-amber-500" />
                                                )}
                                                {permission.name}
                                              </Label>
                                            </div>
                                          ))}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <Button variant="outline" onClick={() => setSelectedResource(null)} className="text-sm">
                              Close
                            </Button>
                          </div>
                        </div>
                      ))}
                  </Card>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center p-6 bg-muted dark:bg-gray-800 rounded-lg">
                      <div className="w-12 h-12 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-primary"
                        >
                          <circle cx="11" cy="11" r="8" />
                          <path d="m21 21-4.3-4.3" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium mb-1">No Resource Selected</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Select a resource from the list to view and manage access permissions
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions">
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-1">
              <CardTitle className="text-xl flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Permission Types
              </CardTitle>
              <CardDescription>View and manage all permission types in the system</CardDescription>
            </CardHeader>
            <CardContent className="px-1">
              <div className="mb-8">
                <Card className="overflow-hidden border">
                  <CardHeader className="bg-muted dark:bg-gray-800 p-4">
                    <CardTitle className="text-base">Add New Permission Type</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <form onSubmit={handleCreatePermission} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="permission-name">Permission Name</Label>
                        <Input
                          id="permission-name"
                          type="text"
                          placeholder="Enter permission name"
                          value={newPermission.name}
                          onChange={(e) => setNewPermission({ ...newPermission, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="permission-category">Category</Label>
                        <Select
                          value={newPermission.category}
                          onValueChange={(value) =>
                            setNewPermission({ ...newPermission, category: value as 'read' | 'write' | 'admin' })
                          }
                        >
                          <SelectTrigger id="permission-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="read">Read</SelectItem>
                            <SelectItem value="write">Write</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="permission-description">Description</Label>
                        <Input
                          id="permission-description"
                          type="text"
                          placeholder="Enter description"
                          value={newPermission.description}
                          onChange={(e) => setNewPermission({ ...newPermission, description: e.target.value })}
                          required
                        />
                      </div>
                      <div className="justify-end">
                        <Button
                          type="submit"
                          disabled={
                            isLoading || !newPermission.name || !newPermission.category || !newPermission.description
                          }
                          className="gap-2"
                        >
                          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                          Add Permission
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {/* Read Permissions */}
                <Card className="overflow-hidden border bg-background dark:bg-gray-900">
                  <CardHeader className="bg-blue-50 dark:bg-blue-900/20 p-4 border-b">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-100 dark:bg-blue-800/30 text-blue-700 dark:text-blue-300 p-1.5 rounded">
                        <Eye className="h-4 w-4" />
                      </span>
                      <CardTitle className="text-base text-blue-700 dark:text-blue-300">Read Permissions</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-[300px] overflow-y-auto divide-y">
                      {permissions
                        .filter((p) => p.category === 'read')
                        .map((permission) => (
                          <div
                            key={permission.id}
                            className="p-3 hover:bg-muted dark:hover:bg-gray-800 transition-colors"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-medium text-sm">{permission.name}</h4>
                                <p className="text-xs text-muted-foreground">{permission.description}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                                >
                                  {permission.category}
                                </Badge>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="h-4 w-4" />
                                      <span className="sr-only">More</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>
                        ))}
                      {permissions.filter((p) => p.category === 'read').length === 0 && (
                        <div className="p-4 text-center text-sm text-muted-foreground">No read permissions defined</div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Write Permissions */}
                <Card className="overflow-hidden border bg-background dark:bg-gray-900">
                  <CardHeader className="bg-amber-50 dark:bg-amber-900/20 p-4 border-b">
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-100 dark:bg-amber-800/30 text-amber-700 dark:text-amber-300 p-1.5 rounded">
                        <Pencil className="h-4 w-4" />
                      </span>
                      <CardTitle className="text-base text-amber-700 dark:text-amber-300">Write Permissions</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-[300px] overflow-y-auto divide-y">
                      {permissions
                        .filter((p) => p.category === 'write')
                        .map((permission) => (
                          <div
                            key={permission.id}
                            className="p-3 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-medium text-sm">{permission.name}</h4>
                                <p className="text-xs text-muted-foreground">{permission.description}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800"
                                >
                                  {permission.category}
                                </Badge>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="h-4 w-4" />
                                      <span className="sr-only">More</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>
                        ))}
                      {permissions.filter((p) => p.category === 'write').length === 0 && (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No write permissions defined
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Admin Permissions */}
                <Card className="overflow-hidden border bg-background dark:bg-gray-900">
                  <CardHeader className="bg-purple-50 dark:bg-purple-900/20 p-4 border-b">
                    <div className="flex items-center gap-2">
                      <span className="bg-purple-100 dark:bg-purple-800/30 text-purple-700 dark:text-purple-300 p-1.5 rounded">
                        <ShieldCheck className="h-4 w-4" />
                      </span>
                      <CardTitle className="text-base text-purple-700 dark:text-purple-300">
                        Admin Permissions
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-[300px] overflow-y-auto divide-y">
                      {permissions
                        .filter((p) => p.category === 'admin')
                        .map((permission) => (
                          <div
                            key={permission.id}
                            className="p-3 hover:bg-muted dark:hover:bg-gray-800 transition-colors"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-medium text-sm">{permission.name}</h4>
                                <p className="text-xs text-muted-foreground">{permission.description}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800"
                                >
                                  {permission.category}
                                </Badge>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="h-4 w-4" />
                                      <span className="sr-only">More</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>
                        ))}
                      {permissions.filter((p) => p.category === 'admin').length === 0 && (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No admin permissions defined
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedPermissionDashboard;
