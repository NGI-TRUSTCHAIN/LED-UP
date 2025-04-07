'use client';

import * as React from 'react';
import { ResourceType } from '../types';
import { formatRecordId, getResourceTypeName } from '../utils/index';
import { formatDistanceToNow } from 'date-fns';

// Icons
import {
  FileText,
  Shield,
  ShieldCheck,
  Calendar,
  User,
  Tag,
  Hash,
  ClipboardList,
  Link,
  Clock,
  Share2,
  Download,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Type for record detail from the RecordsList
import { RecordItem } from './RecordsList';

interface RecordDetailViewProps {
  record: RecordItem;
  onDownload?: () => void;
  onShare?: () => void;
  onVerify?: () => void;
  onClose?: () => void;
}

export function RecordDetailView({ record, onDownload, onShare, onVerify, onClose }: RecordDetailViewProps) {
  const [activeTab, setActiveTab] = React.useState('overview');
  const [copied, setCopied] = React.useState<string | null>(null);

  // Check if metadata is available
  const hasMetadata = record.metadata && !record.error;

  // Format the timestamp
  const formattedDate = record.updatedAt ? new Date(record.updatedAt * 1000).toLocaleString() : 'Unknown';

  const relativeDate = record.updatedAt
    ? formatDistanceToNow(new Date(record.updatedAt * 1000), { addSuffix: true })
    : 'Unknown';

  // Function to copy text to clipboard
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);

    // Reset copied state after 2 seconds
    setTimeout(() => {
      setCopied(null);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{record.metadata?.title || `Record Details`}</h2>
          <p className="text-muted-foreground">
            {record.id.startsWith('0x')
              ? formatRecordId(record.id as `0x${string}`)
              : `${record.id.slice(0, 6)}...${record.id.slice(-4)}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant={record.isVerified ? 'default' : 'outline'}
            className={record.isVerified ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            {record.isVerified ? 'Verified' : 'Unverified'}
          </Badge>

          <Badge variant="outline">{getResourceTypeName(record.resourceType)}</Badge>
        </div>
      </div>

      {record.error && (
        <Alert className="mt-4 bg-red-50 dark:bg-red-950">
          <AlertDescription>Error: {record.error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="flex-1 mt-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
          <TabsTrigger value="technical">Technical Info</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="pt-4 h-full">
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="space-y-6">
              {hasMetadata && (
                <>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground">
                      {record.metadata.description || 'No description available.'}
                    </p>
                  </div>

                  {record.metadata.keywords && record.metadata.keywords.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Keywords</h3>
                      <div className="flex flex-wrap gap-2">
                        {record.metadata.keywords.map((keyword: string, i: number) => (
                          <Badge key={i} variant="secondary">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div>
                <h3 className="text-lg font-semibold mb-2">Record Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-muted/40">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Producer
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{record.producer || 'Unknown'}</span>
                        {record.producer && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(record.producer!, 'producer')}
                          >
                            {copied === 'producer' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/40">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Last Updated
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="font-medium">{relativeDate}</TooltipTrigger>
                          <TooltipContent>
                            <p>{formattedDate}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/40">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <ClipboardList className="h-4 w-4" />
                        Data Size
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <span className="font-medium">{record.dataSize || 0} bytes</span>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/40">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Share2 className="h-4 w-4" />
                        Shared
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <span className="font-medium">{record.sharedCount || 0} times</span>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Metadata Tab */}
        <TabsContent value="metadata" className="pt-4">
          <ScrollArea className="h-[calc(100vh-280px)]">
            {hasMetadata ? (
              <div className="space-y-6">
                {Object.entries(record.metadata).map(([key, value]) => {
                  if (key === 'keywords' || typeof value === 'object') return null;

                  return (
                    <div key={key}>
                      <h3 className="text-sm font-medium text-muted-foreground uppercase">{key}</h3>
                      <p className="font-medium mt-1">{String(value)}</p>
                      <Separator className="mt-2" />
                    </div>
                  );
                })}

                {record.metadata.schema && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground uppercase">Schema</h3>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <div>
                        <p className="text-xs text-muted-foreground">URL</p>
                        <p className="font-medium truncate">{record.metadata.schema.url}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Version</p>
                        <p className="font-medium">{record.metadata.schema.version}</p>
                      </div>
                    </div>
                    <Separator className="mt-2" />
                  </div>
                )}

                {record.metadata.additional && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Additional Data</h3>
                    <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                      {JSON.stringify(record.metadata.additional, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                {record.error ? (
                  <>
                    <h3 className="text-lg font-semibold">Metadata Error</h3>
                    <p className="text-muted-foreground">{record.error}</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold">No Metadata Available</h3>
                    <p className="text-muted-foreground">This record does not have any associated metadata.</p>
                  </>
                )}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        {/* Technical Info Tab */}
        <TabsContent value="technical" className="pt-4">
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Record ID</h3>
                <div className="flex items-center gap-2 bg-muted p-2 rounded">
                  <code className="text-sm flex-1 break-all">{record.id}</code>
                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard(record.id, 'recordId')}>
                    {copied === 'recordId' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {record.metadataCid && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Metadata CID</h3>
                  <div className="flex items-center gap-2 bg-muted p-2 rounded">
                    <code className="text-sm flex-1 break-all">{record.metadataCid}</code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(record.metadataCid!, 'metadataCid')}
                    >
                      {copied === 'metadataCid' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(`https://ipfs.io/ipfs/${record.metadataCid}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold mb-2">Raw Data</h3>
                <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">{JSON.stringify(record, null, 2)}</pre>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <div className="border-t pt-4 mt-auto">
        <div className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>

          <div className="flex gap-2">
            {!record.isVerified && (
              <Button variant="secondary" onClick={onVerify}>
                <ShieldCheck className="h-4 w-4 mr-2" />
                Verify Record
              </Button>
            )}

            <Button variant="outline" onClick={onShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>

            <Button onClick={onDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
