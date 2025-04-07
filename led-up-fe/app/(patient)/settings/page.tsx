'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useAddressToDID, useUpdateDidPublicKey } from '@/features/did-registry/hooks/use-did-registry';
import { generateKeyPair } from '@/features/cryptography';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Key, AlertCircle, CheckCircle, Copy, RefreshCw, Shield, Info } from 'lucide-react';
import { useSonner } from '@/hooks/use-sonner';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { TabButton } from '@/features/data-registry/components/patient-records/PatientRecordsComponents';

export default function SettingsPage() {
  const { address } = useAccount();
  const { data: did, isLoading: isDidLoading } = useAddressToDID(address);
  const { toast } = useSonner();
  const [activeTab, setActiveTab] = useState('did');
  const [newPublicKey, setNewPublicKey] = useState('');
  const [newPrivateKey, setNewPrivateKey] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [copiedDid, setCopiedDid] = useState(false);
  const [copiedPublicKey, setCopiedPublicKey] = useState(false);
  const [copiedPrivateKey, setCopiedPrivateKey] = useState(false);

  const updatePublicKey = useUpdateDidPublicKey();

  const handleCopy = (text: string, type: 'did' | 'public' | 'private') => {
    navigator.clipboard.writeText(text);
    switch (type) {
      case 'did':
        setCopiedDid(true);
        break;
      case 'public':
        setCopiedPublicKey(true);
        break;
      case 'private':
        setCopiedPrivateKey(true);
        break;
    }
    setTimeout(() => {
      setCopiedDid(false);
      setCopiedPublicKey(false);
      setCopiedPrivateKey(false);
    }, 2000);
  };

  const handleGenerateNewKey = async () => {
    try {
      setIsGenerating(true);
      const { privateKey, publicKey } = generateKeyPair();
      setNewPublicKey(publicKey);
      setNewPrivateKey(privateKey);
      setShowPrivateKey(true);
      toast.success('New key pair generated', {
        description: 'Please save your private key securely. You will need it to decrypt your health records.',
      });
    } catch (error) {
      toast.error('Error generating key pair', {
        description: error instanceof Error ? error.message : 'Failed to generate new key pair',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdatePublicKey = async () => {
    if (!did || !newPublicKey) return;

    try {
      await updatePublicKey.mutateAsync({
        did,
        newPublicKey,
      });

      toast.success('Public key updated', {
        description: 'Your DID public key has been successfully updated.',
      });
    } catch (error) {
      toast.error('Error updating public key', {
        description: error instanceof Error ? error.message : 'Failed to update public key',
      });
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and DID configuration.</p>
      </div>

      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2">
          <TabButton
            active={activeTab === 'did'}
            onClick={() => setActiveTab('did')}
            count={0}
            icon={<Key className="h-4 w-4" />}
          >
            DID Management
          </TabButton>
          <TabButton
            active={activeTab === 'security'}
            onClick={() => setActiveTab('security')}
            count={0}
            icon={<Shield className="h-4 w-4" />}
          >
            Security
          </TabButton>
          <TabButton
            active={activeTab === 'preferences'}
            onClick={() => setActiveTab('preferences')}
            count={0}
            icon={<Info className="h-4 w-4" />}
          >
            Preferences
          </TabButton>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'did' && (
            <div className="flex flex-col lg:flex-row gap-6">
              <Card className="border-none shadow-lg flex-1">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl font-bold tracking-tight">DID Management</CardTitle>
                  <CardDescription className="text-base">
                    Manage your Decentralized Identifier (DID) and associated cryptographic keys.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {isDidLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-muted-foreground">Loading your DID information...</p>
                      <Progress value={33} className="w-[60%]" />
                    </div>
                  ) : !did ? (
                    <Alert variant="destructive" className="border-none bg-destructive/20 text-destructive">
                      <AlertCircle className="h-5 w-5" />
                      <AlertTitle className="text-lg">No DID Found</AlertTitle>
                      <AlertDescription className="mt-2">
                        You need to register a DID first. Please contact your administrator to get started.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-8">
                      {/* DID Information Section */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-semibold">Your DID</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2"
                                  onClick={() => handleCopy(did, 'did')}
                                >
                                  <Copy className="h-4 w-4 mr-2" />
                                  {copiedDid ? 'Copied!' : 'Copy'}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Copy DID to clipboard</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input value={did} readOnly className="font-mono text-sm bg-muted/50" />
                          <Badge variant="outline" className="h-8 px-3">
                            <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                            Active
                          </Badge>
                        </div>
                      </div>

                      <Separator className="my-8" />

                      {/* Key Management Section */}
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">Public Key Management</Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8"
                                    onClick={handleGenerateNewKey}
                                    disabled={isGenerating || !!newPublicKey}
                                  >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    {isGenerating ? 'Generating...' : 'Generate New Key'}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Generate a new key pair</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <div className="space-y-2">
                            <Input
                              value={newPublicKey}
                              onChange={(e) => setNewPublicKey(e.target.value)}
                              placeholder="Enter new public key"
                              className="font-mono text-sm bg-muted/50"
                              readOnly={!!newPublicKey}
                            />
                            {newPublicKey && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => handleCopy(newPublicKey, 'public')}
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                {copiedPublicKey ? 'Copied!' : 'Copy Public Key'}
                              </Button>
                            )}
                          </div>
                        </div>

                        {showPrivateKey && (
                          <Alert className="border-none bg-primary/20 dark:bg-primary/20 text-primary border-primary/40 dark:border-primary/50">
                            <AlertCircle className="h-5 w-5 text-primary" />
                            <AlertTitle className="text-lg">Important: Save Your Private Key</AlertTitle>
                            <AlertDescription className="mt-4 space-y-4">
                              <div className="relative">
                                <div className="font-mono bg-background p-3 rounded-md text-sm border">
                                  {newPrivateKey.slice(0, 32)}...{newPrivateKey.slice(-32)}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-2 top-2 h-8 px-2"
                                  onClick={() => handleCopy(newPrivateKey, 'private')}
                                >
                                  <Copy className="h-4 w-4 mr-2" />
                                  {copiedPrivateKey ? 'Copied!' : 'Copy'}
                                </Button>
                              </div>
                              <div className="space-y-2">
                                <p className="text-sm font-medium">Security Warning:</p>
                                <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                                  <li>This private key is required to decrypt your health records</li>
                                  <li>Store it securely and never share it with anyone</li>
                                  <li>If lost, you won't be able to access your encrypted data</li>
                                  <li>Consider using a password manager for secure storage</li>
                                </ul>
                              </div>
                            </AlertDescription>
                          </Alert>
                        )}

                        {newPublicKey && (
                          <Button
                            onClick={handleUpdatePublicKey}
                            disabled={updatePublicKey.isPending}
                            className="w-full h-10"
                          >
                            {updatePublicKey.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating Public Key...
                              </>
                            ) : (
                              'Update Public Key'
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg flex-1">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold tracking-tight">Manage Your Role</CardTitle>
                  <CardDescription className="text-base">
                    Manage your role in the platform and associated permissions.
                  </CardDescription>
                </CardHeader>
                <CardContent></CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'security' && (
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold tracking-tight">Security Settings</CardTitle>
                <CardDescription className="text-base">
                  Manage your account security preferences and authentication methods.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Security settings coming soon...</p>
              </CardContent>
            </Card>
          )}

          {activeTab === 'preferences' && (
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold tracking-tight">User Preferences</CardTitle>
                <CardDescription className="text-base">
                  Customize your application experience and notification settings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">User preferences coming soon...</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
