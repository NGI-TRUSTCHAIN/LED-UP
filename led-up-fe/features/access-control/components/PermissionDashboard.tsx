'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

// Types for permission management
type Permission = {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  category: 'read' | 'write' | 'admin';
};

type User = {
  id: string;
  did: string;
  name: string;
  email: string;
  permissions: string[];
};

type Resource = {
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

export const PermissionDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<User[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for development
  useEffect(() => {
    // This would be replaced with actual API calls
    setPermissions([
      { id: 'p1', name: 'View Data', description: 'Can view data', isEnabled: true, category: 'read' },
      { id: 'p2', name: 'Download Data', description: 'Can download data', isEnabled: true, category: 'read' },
      { id: 'p3', name: 'Edit Data', description: 'Can edit data', isEnabled: true, category: 'write' },
      { id: 'p4', name: 'Delete Data', description: 'Can delete data', isEnabled: true, category: 'write' },
      { id: 'p5', name: 'Manage Users', description: 'Can manage users', isEnabled: true, category: 'admin' },
    ]);

    setUsers([
      { id: 'u1', did: 'did:ethr:0x123...', name: 'Alice', email: 'alice@example.com', permissions: ['p1', 'p2'] },
      { id: 'u2', did: 'did:ethr:0x456...', name: 'Bob', email: 'bob@example.com', permissions: ['p1'] },
      {
        id: 'u3',
        did: 'did:ethr:0x789...',
        name: 'Carol',
        email: 'carol@example.com',
        permissions: ['p1', 'p3', 'p4'],
      },
    ]);

    setResources([
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
    ]);
  }, []);

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.did.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter resources based on search query
  const filteredResources = resources.filter(
    (resource) =>
      resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.cid.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handler for updating user permissions
  const handleUpdateUserPermissions = async (userId: string, permissionIds: string[]) => {
    setIsLoading(true);
    try {
      // This would be an API call to update permissions
      const updatedUsers = users.map((user) => {
        if (user.id === userId) {
          return {
            ...user,
            permissions: permissionIds,
          };
        }
        return user;
      });

      setUsers(updatedUsers);
      toast.success('Permissions updated', {
        description: 'User permissions have been successfully updated.',
      });
    } catch (error) {
      toast.error('Failed to update user permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for updating resource permissions
  const handleUpdateResourcePermissions = async (resourceId: string, userId: string, permissionIds: string[]) => {
    setIsLoading(true);
    try {
      // This would be an API call to update resource permissions
      const updatedResources = resources.map((resource) => {
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
            // Add new permissions for user
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
      });

      setResources(updatedResources);
      toast.success('Resource permissions updated', {
        description: 'Resource permissions have been successfully updated.',
      });
    } catch (error) {
      toast.error('Failed to update resource permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  // Find permission details by ID
  const getPermissionById = (id: string) => {
    return permissions.find((permission) => permission.id === id);
  };

  // Find user details by ID
  const getUserById = (id: string) => {
    return users.find((user) => user.id === id);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Permission Management Dashboard</h1>

      <div className="mb-6">
        <Input
          placeholder="Search users or resources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="permissions">Permission Types</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Permissions</CardTitle>
              <CardDescription>Manage access permissions for individual users across all resources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Users List */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Users</h3>
                  <div className="border rounded-md max-h-[500px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>DID</TableHead>
                          <TableHead>Permissions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow
                            key={user.id}
                            className={selectedUser === user.id ? 'bg-muted' : ''}
                            onClick={() => setSelectedUser(user.id)}
                          >
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell className="truncate max-w-[150px]">{user.did}</TableCell>
                            <TableCell>{user.permissions.length}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* User Details */}
                {selectedUser && (
                  <div>
                    <h3 className="text-lg font-medium mb-4">User Details</h3>
                    {users
                      .filter((user) => user.id === selectedUser)
                      .map((user) => (
                        <div key={user.id} className="space-y-4">
                          <div>
                            <Label>Name</Label>
                            <Input value={user.name} readOnly />
                          </div>
                          <div>
                            <Label>DID</Label>
                            <Input value={user.did} readOnly />
                          </div>
                          <div>
                            <Label>Email</Label>
                            <Input value={user.email} readOnly />
                          </div>
                          <div>
                            <Label className="mb-2 block">Permissions</Label>
                            <div className="space-y-2 border rounded-md p-4">
                              {permissions.map((permission) => (
                                <div key={permission.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`user-${user.id}-permission-${permission.id}`}
                                    checked={user.permissions.includes(permission.id)}
                                    onCheckedChange={(checked) => {
                                      const newPermissions = checked
                                        ? [...user.permissions, permission.id]
                                        : user.permissions.filter((p) => p !== permission.id);

                                      handleUpdateUserPermissions(user.id, newPermissions);
                                    }}
                                  />
                                  <Label
                                    htmlFor={`user-${user.id}-permission-${permission.id}`}
                                    className="cursor-pointer"
                                  >
                                    {permission.name}{' '}
                                    <span className="text-muted-foreground text-sm">({permission.category})</span>
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                          <Button variant="outline" onClick={() => setSelectedUser(null)}>
                            Close
                          </Button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle>Resource Permissions</CardTitle>
              <CardDescription>
                Manage who can access specific resources and what actions they can perform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Resources List */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Resources</h3>
                  <div className="border rounded-md max-h-[500px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Access Type</TableHead>
                          <TableHead>Users with Access</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredResources.map((resource) => (
                          <TableRow
                            key={resource.id}
                            className={selectedResource === resource.id ? 'bg-muted' : ''}
                            onClick={() => setSelectedResource(resource.id)}
                          >
                            <TableCell className="font-medium">{resource.name}</TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  resource.accessType === 'public'
                                    ? 'bg-green-100 text-green-800'
                                    : resource.accessType === 'private'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {resource.accessType}
                              </span>
                            </TableCell>
                            <TableCell>{resource.permissions.length}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Resource Details */}
                {selectedResource && (
                  <div>
                    <h3 className="text-lg font-medium mb-4">Resource Details</h3>
                    {resources
                      .filter((resource) => resource.id === selectedResource)
                      .map((resource) => (
                        <div key={resource.id} className="space-y-4">
                          <div>
                            <Label>Name</Label>
                            <Input value={resource.name} readOnly />
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Textarea value={resource.description} readOnly />
                          </div>
                          <div>
                            <Label>CID</Label>
                            <Input value={resource.cid} readOnly />
                          </div>
                          <div>
                            <Label>Access Type</Label>
                            <div className="flex items-center space-x-4 mt-2">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id="access-public"
                                  name="access-type"
                                  value="public"
                                  checked={resource.accessType === 'public'}
                                  aria-label="Public access type"
                                  onChange={() => {
                                    const updatedResources = resources.map((r) => {
                                      if (r.id === resource.id) {
                                        return { ...r, accessType: 'public' as const };
                                      }
                                      return r;
                                    });
                                    setResources(updatedResources);
                                  }}
                                />
                                <Label htmlFor="access-public">Public</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id="access-private"
                                  name="access-type"
                                  value="private"
                                  checked={resource.accessType === 'private'}
                                  aria-label="Private access type"
                                  onChange={() => {
                                    const updatedResources = resources.map((r) => {
                                      if (r.id === resource.id) {
                                        return { ...r, accessType: 'private' as const };
                                      }
                                      return r;
                                    });
                                    setResources(updatedResources);
                                  }}
                                />
                                <Label htmlFor="access-private">Private</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id="access-restricted"
                                  name="access-type"
                                  value="restricted"
                                  checked={resource.accessType === 'restricted'}
                                  aria-label="Restricted access type"
                                  onChange={() => {
                                    const updatedResources = resources.map((r) => {
                                      if (r.id === resource.id) {
                                        return { ...r, accessType: 'restricted' as const };
                                      }
                                      return r;
                                    });
                                    setResources(updatedResources);
                                  }}
                                />
                                <Label htmlFor="access-restricted">Restricted</Label>
                              </div>
                            </div>
                          </div>
                          <div>
                            <Label className="mb-2 block">User Access</Label>
                            <div className="space-y-4 border rounded-md p-4 max-h-[300px] overflow-y-auto">
                              {users.map((user) => {
                                const userPermission = resource.permissions.find((perm) => perm.userId === user.id);
                                const userPermissionIds = userPermission ? userPermission.permissionIds : [];

                                return (
                                  <div key={user.id} className="border-b pb-3 last:border-0">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="font-medium">{user.name}</span>
                                      <span className="text-sm text-muted-foreground">{user.did}</span>
                                    </div>
                                    <div className="space-y-2">
                                      {permissions
                                        .filter((permission) => permission.category !== 'admin')
                                        .map((permission) => (
                                          <div key={permission.id} className="flex items-center space-x-2">
                                            <Checkbox
                                              id={`resource-${resource.id}-user-${user.id}-permission-${permission.id}`}
                                              checked={userPermissionIds.includes(permission.id)}
                                              onCheckedChange={(checked) => {
                                                const newPermissionIds = checked
                                                  ? [...userPermissionIds, permission.id]
                                                  : userPermissionIds.filter((p) => p !== permission.id);

                                                handleUpdateResourcePermissions(resource.id, user.id, newPermissionIds);
                                              }}
                                            />
                                            <Label
                                              htmlFor={`resource-${resource.id}-user-${user.id}-permission-${permission.id}`}
                                              className="cursor-pointer"
                                            >
                                              {permission.name}
                                            </Label>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          <Button variant="outline" onClick={() => setSelectedResource(null)}>
                            Close
                          </Button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle>Permission Types</CardTitle>
              <CardDescription>Manage the types of permissions that can be assigned to users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Permissions List */}
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {permissions.map((permission) => (
                        <TableRow key={permission.id}>
                          <TableCell className="font-medium">{permission.name}</TableCell>
                          <TableCell>{permission.description}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                permission.category === 'read'
                                  ? 'bg-blue-100 text-blue-800'
                                  : permission.category === 'write'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-purple-100 text-purple-800'
                              }`}
                            >
                              {permission.category}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={permission.isEnabled}
                              onCheckedChange={(checked) => {
                                const updatedPermissions = permissions.map((p) => {
                                  if (p.id === permission.id) {
                                    return { ...p, isEnabled: checked };
                                  }
                                  return p;
                                });
                                setPermissions(updatedPermissions);
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Add New Permission */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Add New Permission</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="permission-name">Name</Label>
                      <Input id="permission-name" placeholder="e.g., Export Data" />
                    </div>
                    <div>
                      <Label htmlFor="permission-category">Category</Label>
                      <select
                        id="permission-category"
                        aria-label="Permission category"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="read">Read</option>
                        <option value="write">Write</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="permission-description">Description</Label>
                      <Textarea
                        id="permission-description"
                        placeholder="Describe what this permission allows"
                        rows={3}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Button>Add Permission</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PermissionDashboard;
