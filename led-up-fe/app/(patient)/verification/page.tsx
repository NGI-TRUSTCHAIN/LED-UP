'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AgeVerifier, FhirVerifier, HashVerifier } from '@/features/circom/components';
import { Separator } from '@/components/ui/separator';
import { CircuitType } from '@/features/circom/types';
import { getCircuitMetadata } from '@/features/circom/utils/proof';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, FileText, Hash, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function CircomPage() {
  const [activeTab, setActiveTab] = useState<string>('age');

  // Get metadata for each circuit
  const ageVerifierMeta = getCircuitMetadata(CircuitType.AGE_VERIFIER);
  const fhirVerifierMeta = getCircuitMetadata(CircuitType.FHIR_VERIFIER);
  const hashVerifierMeta = getCircuitMetadata(CircuitType.HASH_VERIFIER);

  return (
    <main className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 mb-12">
      <div className="space-y-5 mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-primary">Zero-Knowledge Proof Verifiers</h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Verify claims using zero-knowledge proofs with Circom circuits. These verifiers demonstrate how to use
          advanced cryptography to prove claims without revealing sensitive data.
        </p>
        <Separator className="my-6" />
      </div>

      <Tabs defaultValue="age" className="space-y-8" onValueChange={setActiveTab} orientation="vertical">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-64 flex-shrink-0">
            <TabsList className="flex flex-col w-full h-auto space-y-2 bg-transparent">
              <TabsTrigger
                value="age"
                className="w-full flex items-center justify-start pl-4 py-3 text-start gap-3 data-[state=active]:bg-primary/30"
              >
                <Shield className="h-5 w-5" />
                <span>Age Verifier</span>
              </TabsTrigger>
              <TabsTrigger
                value="fhir"
                className="w-full flex items-center justify-start pl-4 py-3 text-start gap-3 data-[state=active]:bg-primary/30"
              >
                <FileText className="h-5 w-5" />
                <span>FHIR Verifier</span>
              </TabsTrigger>
              <TabsTrigger
                value="hash"
                className="w-full flex items-center justify-start pl-4 py-3 text-start gap-3 data-[state=active]:bg-primary/30"
              >
                <Hash className="h-5 w-5" />
                <span>Hash Verifier</span>
              </TabsTrigger>
            </TabsList>

            <Card className="mt-6 bg-muted/50">
              <CardContent className="pt-6">
                <h3 className="text-base font-medium mb-3">About ZK Proofs</h3>
                <p className="text-sm text-muted-foreground">
                  Zero-knowledge proofs allow one party to prove a statement is true without revealing additional
                  information.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  In healthcare, this enables privacy-preserving verification of sensitive information.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex-1">
            <div className="mb-6">
              {activeTab === 'age' && (
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Age Verification</h2>
                  <p className="text-muted-foreground">{ageVerifierMeta.description}</p>
                </div>
              )}

              {activeTab === 'fhir' && (
                <div>
                  <h2 className="text-2xl font-semibold mb-2">FHIR Resource Verification</h2>
                  <p className="text-muted-foreground">{fhirVerifierMeta.description}</p>
                </div>
              )}

              {activeTab === 'hash' && (
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Hash Verification</h2>
                  <p className="text-muted-foreground">{hashVerifierMeta.description}</p>
                </div>
              )}
            </div>

            <Alert variant="default" className="mb-6 bg-primary/10 text-primary flex items-start gap-5">
              <AlertDescription className="flex items-start gap-5">
                <AlertTriangle className="h-6 w-6 text-primary " />
                <p>
                  Input your data below to generate and verify zero-knowledge proofs. All calculations happen in your
                  browser.
                </p>
              </AlertDescription>
            </Alert>

            <Card className="overflow-hidden border shadow-sm">
              <TabsContent value="age" className="m-0 focus:outline-none">
                <AgeVerifier />
              </TabsContent>

              <TabsContent value="fhir" className="m-0 focus:outline-none">
                <FhirVerifier />
              </TabsContent>

              <TabsContent value="hash" className="m-0 focus:outline-none">
                <HashVerifier />
              </TabsContent>
            </Card>
          </div>
        </div>
      </Tabs>
    </main>
  );
}
