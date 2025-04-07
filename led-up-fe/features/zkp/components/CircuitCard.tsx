import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircuitType, VerificationResult } from '../types';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

interface CircuitCardProps {
  title: string;
  description: string;
  circuitType: CircuitType;
  loading: boolean;
  result: VerificationResult | null;
  resultCode: number | null;
  resultMessage: string | null;
  error: string | null;
  onReset: () => void;
  children: React.ReactNode;
  proof?: any;
  publicSignals?: string[];
  customResultDisplay?: React.ReactNode;
}

const CircuitCard: React.FC<CircuitCardProps> = ({
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
  customResultDisplay,
}) => {
  const [detailsOpen, setDetailsOpen] = React.useState(false);

  const renderResult = () => {
    if (loading) {
      return (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 font-medium">Error</p>
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      );
    }

    if (customResultDisplay) {
      return (
        <div className="space-y-4">
          {customResultDisplay}

          {(proof || publicSignals) && (
            <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen} className="w-full">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Proof Details</p>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {detailsOpen ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent>
                <div className="space-y-2 mt-2">
                  {resultCode !== null && (
                    <div className="p-2 bg-gray-50 rounded-md">
                      <p className="text-xs font-medium">Result Code: {resultCode}</p>
                      {resultMessage && <p className="text-xs text-gray-600">{resultMessage}</p>}
                    </div>
                  )}

                  {publicSignals && (
                    <div className="p-2 bg-gray-50 rounded-md">
                      <p className="text-xs font-medium">Public Signals:</p>
                      <div className="text-xs overflow-auto p-2 bg-gray-100 rounded">
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
                    <div className="p-2 bg-gray-50 rounded-md">
                      <p className="text-xs font-medium">Proof:</p>
                      <details className="text-xs">
                        <summary className="cursor-pointer hover:text-blue-600">View Proof (Click to expand)</summary>
                        <pre className="text-xs overflow-auto p-2 mt-2 bg-gray-100 rounded">
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

    if (result) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant={result.success ? 'default' : 'destructive'}>{result.success ? 'Success' : 'Failed'}</Badge>
            {resultCode !== null && <Badge variant="outline">Code: {resultCode}</Badge>}
          </div>

          {resultMessage && <p className="text-sm text-gray-700">{resultMessage}</p>}

          {(proof || publicSignals) && (
            <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen} className="w-full">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Proof Details</p>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {detailsOpen ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent>
                <div className="space-y-2 mt-2">
                  {resultCode !== null && (
                    <div className="p-2 bg-gray-50 rounded-md">
                      <p className="text-xs font-medium">Result Code: {resultCode}</p>
                      {resultMessage && <p className="text-xs text-gray-600">{resultMessage}</p>}
                    </div>
                  )}

                  {publicSignals && (
                    <div className="p-2 bg-gray-50 rounded-md">
                      <p className="text-xs font-medium">Public Signals:</p>
                      <div className="text-xs overflow-auto p-2 bg-gray-100 rounded">
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
                    <div className="p-2 bg-gray-50 rounded-md">
                      <p className="text-xs font-medium">Proof:</p>
                      <details className="text-xs">
                        <summary className="cursor-pointer hover:text-blue-600">View Proof (Click to expand)</summary>
                        <pre className="text-xs overflow-auto p-2 mt-2 bg-gray-100 rounded">
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <Badge variant="outline">{circuitType}</Badge>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>{children}</CardContent>

      {(loading || error || result) && (
        <CardFooter className="flex flex-col items-start border-t p-4">
          <div className="w-full space-y-4">
            {renderResult()}

            {(result || error) && (
              <div className="flex justify-end w-full">
                <Button variant="outline" onClick={onReset} disabled={loading}>
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

export default CircuitCard;
