import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircuitType } from '../types';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDownIcon, ChevronUpIcon, RefreshCwIcon, CodeIcon, FileTextIcon, CircleAlertIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ZoKratesCardProps {
  title: string;
  description: string;
  circuitType: CircuitType;
  loading: boolean;
  result: string | null;
  resultCode: number | null;
  resultMessage: string | null;
  error: string | null;
  onReset: () => void;
  children: React.ReactNode;
  proof?: any | null;
  publicSignals?: string[] | null;
  circuitReady?: boolean;
}

const ZoKratesCard: React.FC<ZoKratesCardProps> = ({
  title,
  description,
  circuitType,
  loading,
  result,
  resultCode,
  resultMessage,
  error,
  onReset,
  children,
  proof,
  publicSignals,
  circuitReady = true,
}) => {
  const [detailsOpen, setDetailsOpen] = React.useState(false);

  // Determine badge color based on result
  const getBadgeVariant = () => {
    if (result === null) return 'outline';
    if (result === 'success') return 'default'; // Success
    return 'destructive'; // Failure
  };

  const renderResultBadge = () => {
    if (result === null) return null;

    return <Badge variant={getBadgeVariant()}>{result === 'success' ? 'Verified' : 'Failed'}</Badge>;
  };

  const renderResult = () => {
    if (loading) {
      return (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive" className="mt-4">
          <CircleAlertIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (result !== null) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {renderResultBadge()}
            {resultCode !== null && (
              <Badge variant="outline" className="font-mono">
                Code: {resultCode}
              </Badge>
            )}
          </div>

          {resultMessage && (
            <div
              className={`text-sm rounded-md p-3 ${
                result === 'success'
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                  : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
              }`}
            >
              {resultMessage}
            </div>
          )}

          {(proof || publicSignals) && (
            <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen} className="w-full mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CodeIcon className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Proof Details</span>
                </div>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                    {detailsOpen ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent>
                <div className="space-y-3 mt-3">
                  {publicSignals && publicSignals.length > 0 && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <div className="flex items-center mb-2">
                        <FileTextIcon className="h-3.5 w-3.5 mr-2" />
                        <p className="text-xs font-medium">Public Signals:</p>
                      </div>
                      <div className="text-xs overflow-auto p-2 bg-gray-100 dark:bg-gray-900 rounded">
                        {publicSignals.map((signal, index) => (
                          <div key={index} className="mb-1">
                            <span className="font-mono">
                              [{index}]: {signal}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {proof && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <div className="flex items-center mb-2">
                        <CodeIcon className="h-3.5 w-3.5 mr-2" />
                        <p className="text-xs font-medium">Proof:</p>
                      </div>
                      <details className="text-xs">
                        <summary className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400">
                          View Proof (Click to expand)
                        </summary>
                        <pre className="text-xs overflow-auto p-2 mt-2 bg-gray-100 dark:bg-gray-900 rounded font-mono">
                          {JSON.stringify(proof, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <Card className="w-full overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
          <Badge variant="outline" className="font-mono">
            {circuitType}
          </Badge>
        </div>
        <CardDescription className="text-gray-500 dark:text-gray-400">{description}</CardDescription>
      </CardHeader>

      <CardContent className="p-6">
        {!circuitReady && (
          <Alert variant="destructive" className="mb-6">
            <CircleAlertIcon className="h-4 w-4" />
            <AlertTitle>Circuit Not Available</AlertTitle>
            <AlertDescription>
              The circuit files are not properly loaded. Please ensure you've run the
              <code className="mx-1 px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">compile_circuits.sh</code>
              script to copy circuit files to the public directory.
            </AlertDescription>
          </Alert>
        )}

        {children}
      </CardContent>

      {(loading || error || result !== null) && (
        <CardFooter className="flex flex-col items-start border-t border-gray-100 dark:border-gray-800 p-6 bg-gray-50 dark:bg-gray-900">
          <div className="w-full space-y-4">
            {renderResult()}

            {(result !== null || error) && (
              <div className="flex justify-end w-full mt-4">
                <Button variant="outline" onClick={onReset} disabled={loading} className="flex items-center gap-2">
                  <RefreshCwIcon className="h-4 w-4" />
                  Reset
                </Button>
              </div>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default ZoKratesCard;
