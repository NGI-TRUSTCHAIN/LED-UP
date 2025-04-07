'use client';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';

interface KeySecurityConfirmationProps {
  onBack: () => void;
  onNext: () => void;
}

export function KeySecurityConfirmation({ onBack, onNext }: KeySecurityConfirmationProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border border-border backdrop-blur-sm">
      <CardHeader className="space-y-4 text-center pb-6">
        <div className="mx-auto bg-primary/10 text-primary rounded-full p-2.5 w-fit">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">
          Security Confirmation
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-8">
        <Alert variant="destructive" className="border border-destructive/50 bg-destructive/10">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="font-medium">Important Reminder</AlertTitle>
          <AlertDescription className="mt-1">
            Please ensure you have saved your private key in a secure location. You will not be able to recover it if
            lost.
          </AlertDescription>
        </Alert>

        <div className="space-y-6 p-6 rounded-lg bg-muted/50 border border-border">
          <h3 className="font-medium text-lg">Before proceeding, confirm that you have:</h3>
          <ul className="space-y-4 list-none">
            {[
              'Saved your private key in a secure location',
              'Verified that your public key is correctly displayed in your DID document',
              'Understood that the private key cannot be recovered if lost',
            ].map((text, index) => (
              <li key={index} className="flex items-start gap-3 group">
                <span className="bg-primary/10 text-primary rounded-full p-1 mt-0.5 shrink-0 transition-colors group-hover:bg-primary/20">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between gap-4 pt-6">
        <Button variant="outline" onClick={onBack} className="w-full border-border hover:bg-muted/50 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={onNext}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
        >
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
