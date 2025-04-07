'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { UserRegistrationForm } from '@/features/registration/components/UserRegistrationForm';
import { RegistrationSteps } from '@/features/registration/components/RegistrationSteps';
import { RegistrationProvider } from '@/features/registration/contexts/registration-provider';

export default function RegisterPage() {
  const [activeTab, setActiveTab] = useState<string>('consumer');

  return (
    <RegistrationProvider>
      <div className="container mx-auto py-8 max-w-5xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">LED-UP Registration</h1>
          <p className="text-muted-foreground mt-2">Register to access health records securely on the blockchain</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left sidebar with steps */}
          <div className="hidden md:block">
            <Card>
              <CardHeader>
                <CardTitle>Registration Steps</CardTitle>
                <CardDescription>Complete these steps to register</CardDescription>
              </CardHeader>
              <CardContent>
                <RegistrationSteps userType={activeTab as 'consumer' | 'producer'} />
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Register as a Patient or Provider</CardTitle>
                <CardDescription>Choose your role in the healthcare ecosystem</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs
                  defaultValue="consumer"
                  value={activeTab}
                  onValueChange={(value) => setActiveTab(value)}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="consumer">Patient</TabsTrigger>
                    <TabsTrigger value="producer">Healthcare Provider</TabsTrigger>
                  </TabsList>

                  <div className="md:hidden mb-6">
                    <RegistrationSteps userType={activeTab as 'consumer' | 'producer'} />
                  </div>

                  <Separator className="my-4" />

                  <TabsContent value="consumer">
                    <div className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        <p>As a patient, you'll be able to:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>View your health records securely</li>
                          <li>Grant and revoke access to your data</li>
                          <li>Track who has accessed your information</li>
                          <li>Receive notifications about your healthcare</li>
                        </ul>
                      </div>

                      <UserRegistrationForm userType="consumer" />
                    </div>
                  </TabsContent>

                  <TabsContent value="producer">
                    <div className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        <p>As a healthcare provider, you&apos;ll be able to:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Create and update patient health records</li>
                          <li>Request access to patient data</li>
                          <li>Collaborate with other healthcare providers</li>
                          <li>Maintain a secure record of your activities</li>
                        </ul>
                      </div>

                      <UserRegistrationForm userType="producer" />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RegistrationProvider>
  );
}
