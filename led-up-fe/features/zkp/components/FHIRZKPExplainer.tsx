'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, Lock, FileCheck, Database, Eye, EyeOff, History, Server, ArrowRight } from 'lucide-react';

export default function FHIRZKPExplainer() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">How ZKP Verification Works for FHIR Data</CardTitle>
          <CardDescription>
            Understand how zero-knowledge proofs protect your sensitive health information while enabling verification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="process">Process</TabsTrigger>
              <TabsTrigger value="benefits">Benefits</TabsTrigger>
              <TabsTrigger value="modes">Verification Modes</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 pt-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">Zero-Knowledge Proofs for Healthcare</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Zero-knowledge proofs (ZKPs) are cryptographic methods that allow one party to prove to another that
                    a statement is true without revealing any information beyond the validity of the statement itself.
                  </p>

                  <p className="text-sm mb-2">In the context of FHIR data verification:</p>
                  <ul className="list-disc list-inside text-sm space-y-1 mb-4">
                    <li>Your sensitive health information remains private</li>
                    <li>Only the validity of specific claims is proven</li>
                    <li>No actual personal health information is exposed on-chain</li>
                    <li>Verification is cryptographically secure and tamper-proof</li>
                  </ul>
                </div>

                <div className="flex-1 bg-slate-50 rounded-md p-4 border">
                  <h3 className="text-base font-medium mb-3 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-indigo-500" />
                    Key Advantages
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="bg-indigo-100 p-1.5 rounded-full mr-3 mt-0.5">
                        <Lock className="h-4 w-4 text-indigo-700" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Privacy Preservation</h4>
                        <p className="text-xs text-muted-foreground">
                          Your health data stays private while still enabling verification
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="bg-indigo-100 p-1.5 rounded-full mr-3 mt-0.5">
                        <FileCheck className="h-4 w-4 text-indigo-700" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Data Integrity</h4>
                        <p className="text-xs text-muted-foreground">
                          Cryptographic proofs ensure data hasn't been tampered with
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="bg-indigo-100 p-1.5 rounded-full mr-3 mt-0.5">
                        <Database className="h-4 w-4 text-indigo-700" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Immutable Records</h4>
                        <p className="text-xs text-muted-foreground">
                          Blockchain-based verification creates permanent audit trails
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Alert className="bg-blue-50 border-blue-200 text-blue-800">
                <Shield className="h-4 w-4 text-blue-600" />
                <AlertTitle>HIPAA Compliance Potential</AlertTitle>
                <AlertDescription>
                  By using zero-knowledge proofs, this system is designed with privacy in mind, potentially aligning
                  with healthcare compliance requirements by never exposing Protected Health Information (PHI) on-chain.
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="process" className="space-y-4 pt-4">
              <h3 className="text-lg font-semibold">The ZKP Verification Process</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Understanding how your FHIR data moves through the zero-knowledge proof verification workflow.
              </p>

              <div className="relative bg-white rounded-lg border p-4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 z-0"></div>
                <div className="relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col items-center text-center space-y-2 p-4 bg-white rounded-lg shadow-sm">
                      <div className="h-12 w-12 flex items-center justify-center bg-indigo-100 rounded-full">
                        <FileCheck className="h-6 w-6 text-indigo-600" />
                      </div>
                      <h4 className="font-medium">1. Data Preparation</h4>
                      <p className="text-xs text-muted-foreground">
                        FHIR resource data is hashed and prepared for verification
                      </p>
                    </div>

                    <div className="flex flex-col items-center text-center space-y-2 p-4 bg-white rounded-lg shadow-sm">
                      <div className="h-12 w-12 flex items-center justify-center bg-indigo-100 rounded-full">
                        <EyeOff className="h-6 w-6 text-indigo-600" />
                      </div>
                      <h4 className="font-medium">2. Proof Generation</h4>
                      <p className="text-xs text-muted-foreground">
                        Zero-knowledge proof is generated without revealing sensitive data
                      </p>
                    </div>

                    <div className="flex flex-col items-center text-center space-y-2 p-4 bg-white rounded-lg shadow-sm">
                      <div className="h-12 w-12 flex items-center justify-center bg-indigo-100 rounded-full">
                        <Server className="h-6 w-6 text-indigo-600" />
                      </div>
                      <h4 className="font-medium">3. On-Chain Verification</h4>
                      <p className="text-xs text-muted-foreground">
                        Proof is verified on-chain, creating immutable record
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-center my-4">
                    <div className="hidden md:flex items-center">
                      <ArrowRight className="h-5 w-5 text-slate-400" />
                      <div className="w-20 h-0.5 bg-slate-200"></div>
                      <ArrowRight className="h-5 w-5 text-slate-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col items-center text-center space-y-2 p-4 bg-white rounded-lg shadow-sm">
                      <div className="h-12 w-12 flex items-center justify-center bg-green-100 rounded-full">
                        <Shield className="h-6 w-6 text-green-600" />
                      </div>
                      <h4 className="font-medium">4. Result Storage</h4>
                      <p className="text-xs text-muted-foreground">
                        Verification result is securely stored with an expiration date
                      </p>
                    </div>

                    <div className="flex flex-col items-center text-center space-y-2 p-4 bg-white rounded-lg shadow-sm">
                      <div className="h-12 w-12 flex items-center justify-center bg-green-100 rounded-full">
                        <History className="h-6 w-6 text-green-600" />
                      </div>
                      <h4 className="font-medium">5. Verification History</h4>
                      <p className="text-xs text-muted-foreground">
                        Access your verification history for future reference
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-base font-medium mb-2">Technical Details</h4>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>How is my FHIR data processed?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm mb-2">Your FHIR resource undergoes several transformations:</p>
                      <ol className="list-decimal list-inside text-sm space-y-1">
                        <li>Key fields are extracted based on resource type (Patient, Observation, etc.)</li>
                        <li>Field values are converted to numeric representations</li>
                        <li>The entire resource is cryptographically hashed using SHA-256</li>
                        <li>A zero-knowledge circuit proves properties without revealing the data</li>
                        <li>The proof is verified on-chain, creating an immutable verification record</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2">
                    <AccordionTrigger>What happens to my data?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm mb-2">Your sensitive health data remains private:</p>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Raw FHIR data never leaves your browser</li>
                        <li>Only cryptographic proofs and public parameters are sent to the blockchain</li>
                        <li>No personal health information is stored on-chain</li>
                        <li>The proof verification results in a tamper-proof, immutable record</li>
                        <li>Verification history is stored locally in your browser</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3">
                    <AccordionTrigger>What cryptography is used?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm">This system uses advanced cryptographic primitives including:</p>
                      <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                        <li>Zero-Knowledge Succinct Non-Interactive Arguments of Knowledge (zkSNARKs)</li>
                        <li>SHA-256 cryptographic hashing</li>
                        <li>Ethereum blockchain for immutable record-keeping</li>
                        <li>Public-key cryptography for identity verification</li>
                        <li>Time-lock encryption for data with expiration dates</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </TabsContent>

            <TabsContent value="benefits" className="space-y-4 pt-4">
              <h3 className="text-lg font-semibold">Benefits of ZKP for FHIR Data</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Zero-knowledge proofs offer unique advantages for healthcare data verification.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <h4 className="text-base font-medium mb-3 flex items-center text-purple-700">
                    <Eye className="h-5 w-5 mr-2" />
                    For Patients
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <div className="bg-purple-100 p-1 rounded-full mr-2 mt-0.5">
                        <div className="h-3 w-3 bg-purple-500 rounded-full"></div>
                      </div>
                      <p className="text-sm">Control over sensitive health information</p>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-purple-100 p-1 rounded-full mr-2 mt-0.5">
                        <div className="h-3 w-3 bg-purple-500 rounded-full"></div>
                      </div>
                      <p className="text-sm">Selective disclosure of specific health data</p>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-purple-100 p-1 rounded-full mr-2 mt-0.5">
                        <div className="h-3 w-3 bg-purple-500 rounded-full"></div>
                      </div>
                      <p className="text-sm">Privacy-preserving verification for insurance and services</p>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-purple-100 p-1 rounded-full mr-2 mt-0.5">
                        <div className="h-3 w-3 bg-purple-500 rounded-full"></div>
                      </div>
                      <p className="text-sm">Immutable record of verified health data</p>
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <h4 className="text-base font-medium mb-3 flex items-center text-indigo-700">
                    <Server className="h-5 w-5 mr-2" />
                    For Providers
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <div className="bg-indigo-100 p-1 rounded-full mr-2 mt-0.5">
                        <div className="h-3 w-3 bg-indigo-500 rounded-full"></div>
                      </div>
                      <p className="text-sm">HIPAA-compliant data verification</p>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-indigo-100 p-1 rounded-full mr-2 mt-0.5">
                        <div className="h-3 w-3 bg-indigo-500 rounded-full"></div>
                      </div>
                      <p className="text-sm">Reduced liability for handling sensitive information</p>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-indigo-100 p-1 rounded-full mr-2 mt-0.5">
                        <div className="h-3 w-3 bg-indigo-500 rounded-full"></div>
                      </div>
                      <p className="text-sm">Tamper-proof verification of patient records</p>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-indigo-100 p-1 rounded-full mr-2 mt-0.5">
                        <div className="h-3 w-3 bg-indigo-500 rounded-full"></div>
                      </div>
                      <p className="text-sm">Streamlined verification without compromising privacy</p>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mt-4">
                <h4 className="text-base font-medium mb-3">Real-World Applications</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-3 rounded shadow-sm">
                    <h5 className="text-sm font-medium mb-2">Insurance Claims</h5>
                    <p className="text-xs text-slate-600">Verify medical diagnoses without disclosing full records</p>
                  </div>
                  <div className="bg-white p-3 rounded shadow-sm">
                    <h5 className="text-sm font-medium mb-2">Clinical Trials</h5>
                    <p className="text-xs text-slate-600">Prove eligibility criteria without exposing sensitive data</p>
                  </div>
                  <div className="bg-white p-3 rounded shadow-sm">
                    <h5 className="text-sm font-medium mb-2">Health Credentials</h5>
                    <p className="text-xs text-slate-600">Verify vaccination status or test results privately</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="modes" className="space-y-4 pt-4">
              <h3 className="text-lg font-semibold">Verification Modes Explained</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Our system offers three different verification modes to suit your privacy needs.
              </p>

              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-white">
                  <div className="flex items-center mb-3">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <FileCheck className="h-4 w-4 text-green-600" />
                    </div>
                    <h4 className="text-lg font-medium">Basic Validation</h4>
                  </div>
                  <p className="text-sm mb-3">
                    Verifies that the complete FHIR resource matches the provided hash and that the structure is valid,
                    without revealing any specific fields.
                  </p>
                  <div className="bg-slate-50 p-3 rounded-md">
                    <h5 className="text-sm font-medium mb-1">Best For:</h5>
                    <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                      <li>Simple existence verification</li>
                      <li>Proving data integrity</li>
                      <li>Establishing a chain of custody</li>
                    </ul>
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-white">
                  <div className="flex items-center mb-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <Eye className="h-4 w-4 text-blue-600" />
                    </div>
                    <h4 className="text-lg font-medium">Selective Disclosure</h4>
                  </div>
                  <p className="text-sm mb-3">
                    Allows you to choose specific fields to disclose while keeping others private. The proof verifies
                    only the selected fields match the expected values.
                  </p>
                  <div className="bg-slate-50 p-3 rounded-md">
                    <h5 className="text-sm font-medium mb-1">Best For:</h5>
                    <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                      <li>Sharing only relevant information</li>
                      <li>Insurance verification</li>
                      <li>Eligibility checks</li>
                      <li>Age or status verification</li>
                    </ul>
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-white">
                  <div className="flex items-center mb-3">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                      <Database className="h-4 w-4 text-purple-600" />
                    </div>
                    <h4 className="text-lg font-medium">Reference Validation</h4>
                  </div>
                  <p className="text-sm mb-3">
                    Verifies relationships between different FHIR resources, such as confirming an Observation belongs
                    to a specific Patient, without revealing the full details of either resource.
                  </p>
                  <div className="bg-slate-50 p-3 rounded-md">
                    <h5 className="text-sm font-medium mb-1">Best For:</h5>
                    <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                      <li>Proving resource relationships</li>
                      <li>Verifying medical history connections</li>
                      <li>Establishing care continuity</li>
                      <li>Complex healthcare workflows</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex flex-col md:flex-row gap-4">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Try It Yourself</CardTitle>
            <CardDescription>Test the ZKP verification with your own FHIR data</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              Ready to experience privacy-preserving verification? Try our FHIR verification tool with your health data.
            </p>
            <Button className="w-full">Go to FHIR Verification Tool</Button>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Learn More</CardTitle>
            <CardDescription>Additional resources about zero-knowledge proofs</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="text-sm flex items-start">
                <div className="bg-slate-100 p-1 rounded-full mr-2 mt-0.5">
                  <div className="h-2 w-2 bg-slate-500 rounded-full"></div>
                </div>
                <a href="#" className="text-blue-600 hover:underline">
                  Introduction to Zero-Knowledge Proofs
                </a>
              </li>
              <li className="text-sm flex items-start">
                <div className="bg-slate-100 p-1 rounded-full mr-2 mt-0.5">
                  <div className="h-2 w-2 bg-slate-500 rounded-full"></div>
                </div>
                <a href="#" className="text-blue-600 hover:underline">
                  FHIR Data Standards & Privacy
                </a>
              </li>
              <li className="text-sm flex items-start">
                <div className="bg-slate-100 p-1 rounded-full mr-2 mt-0.5">
                  <div className="h-2 w-2 bg-slate-500 rounded-full"></div>
                </div>
                <a href="#" className="text-blue-600 hover:underline">
                  Healthcare Blockchain Applications
                </a>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
