'use client';
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AgeVerifier, HashVerifier, FhirVerifier } from './components';
import { CircleCheck, Info, AlertTriangle, TerminalSquare } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const ZoKratesDemo: React.FC = () => {
  const [compilationStatus, setCompilationStatus] = useState<'idle' | 'compiling' | 'success' | 'error'>('idle');
  const [compilationMessage, setCompilationMessage] = useState<string>('');

  // This is a mock function - in a real app, this would interact with the ZoKrates compiler
  const handleCompileCircuits = async () => {
    setCompilationStatus('compiling');
    setCompilationMessage('Compiling ZoKrates circuits...');

    // Simulate compilation time
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // For demo purposes, we'll simulate success
    setCompilationStatus('success');
    setCompilationMessage('All ZoKrates circuits compiled successfully!');
  };

  return (
    <main className="container max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">ZoKrates Zero-Knowledge Proofs</h1>
          <p className="text-muted-foreground">
            Generate and verify zero-knowledge proofs for sensitive data using ZoKrates
          </p>

          {/* Compilation Status Alert */}
          {compilationStatus !== 'idle' && (
            <Alert
              variant={
                compilationStatus === 'error' ? 'destructive' : compilationStatus === 'success' ? 'default' : null
              }
              className={
                compilationStatus === 'success'
                  ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                  : compilationStatus === 'compiling'
                  ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                  : ''
              }
            >
              {compilationStatus === 'success' && (
                <CircleCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
              )}
              {compilationStatus === 'compiling' && (
                <TerminalSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              )}
              {compilationStatus === 'error' && <AlertTriangle className="h-4 w-4" />}
              <AlertTitle>
                {compilationStatus === 'success' && 'Compilation Successful'}
                {compilationStatus === 'compiling' && 'Compiling Circuits'}
                {compilationStatus === 'error' && 'Compilation Failed'}
              </AlertTitle>
              <AlertDescription>{compilationMessage}</AlertDescription>
            </Alert>
          )}

          {/* Info Alert */}
          <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertTitle>How it works</AlertTitle>
            <AlertDescription>
              ZoKrates allows you to create and verify zero-knowledge proofs. This means you can prove statements about
              private data without revealing the data itself. Try out the different verifiers below to see how it works.
            </AlertDescription>
          </Alert>

          {/* Compile Button */}
          <div className="flex justify-end">
            <button
              onClick={handleCompileCircuits}
              disabled={compilationStatus === 'compiling'}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {compilationStatus === 'compiling' ? 'Compiling...' : 'Compile ZoKrates Circuits'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="age" className="w-full">
          <TabsList className="w-full max-w-md grid grid-cols-3">
            <TabsTrigger value="age">Age Verification</TabsTrigger>
            <TabsTrigger value="hash">Hash Verification</TabsTrigger>
            <TabsTrigger value="fhir">FHIR Verification</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="age" className="mt-0">
              <AgeVerifier />
            </TabsContent>

            <TabsContent value="hash" className="mt-0">
              <HashVerifier />
            </TabsContent>

            <TabsContent value="fhir" className="mt-0">
              <FhirVerifier />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </main>
  );
};

export default ZoKratesDemo;
