'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  ChevronRight,
  Copy,
  AlertCircle,
  CheckCircle,
  Loader2,
  FileText,
  Key,
  FileKey,
  CheckCheck,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';
import { ArrowRight } from 'lucide-react';

export interface DidDocumentFormProps {
  didIdentifier: string;
  publicKey: string;
  didDocument: string;
  isProcessing: boolean;
  keySaved: boolean;
  didCreated: boolean;
  onDidDocumentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onCopyPublicKey: () => void;
  onCancel: () => void;
  onNext: () => void;
  onRegister: () => void;
}

export function DidDocumentForm({
  didIdentifier,
  publicKey,
  didDocument,
  isProcessing,
  keySaved,
  didCreated,
  onDidDocumentChange,
  onCopyPublicKey,
  onCancel,
  onNext,
  onRegister,
}: DidDocumentFormProps) {
  const handleRegister = () => {
    if (!keySaved) {
      onNext();
      return;
    }
    onRegister();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-6">
      <div className="space-y-6">
        {/* DID Identifier Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">DID Identifier</Label>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 border border-border/40">
            <div className="flex items-center space-x-2 text-sm font-mono">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">{didIdentifier}</span>
            </div>
          </div>
        </motion.div>

        {/* Public Key Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Public Key</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCopyPublicKey}
              className="text-xs hover:bg-primary/10 hover:text-primary"
            >
              <Copy className="h-3.5 w-3.5 mr-1.5" />
              Copy
            </Button>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 border border-border/40">
            <div className="flex items-center space-x-2 text-sm font-mono">
              <Key className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground break-all">{publicKey}</span>
            </div>
          </div>
        </motion.div>

        {/* DID Document Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="space-y-3"
        >
          <Label className="text-base font-semibold">DID Document</Label>
          <Textarea
            value={didDocument}
            onChange={onDidDocumentChange}
            className="font-mono text-sm h-[200px] bg-muted/50 border-border/40"
          />
        </motion.div>
      </div>

      {/* Security Checklist */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="p-4 rounded-lg border border-border/40 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm"
      >
        <Label className="text-base font-semibold">Security Checklist</Label>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div
              className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center transition-colors duration-200',
                keySaved
                  ? 'bg-green-500/20 text-green-500 ring-2 ring-green-500/20'
                  : 'bg-muted-foreground/20 text-muted-foreground/40'
              )}
            >
              <Check className="h-3 w-3" />
            </div>
            <span className={cn('text-sm', keySaved ? 'text-green-500' : 'text-muted-foreground')}>
              Private Key Saved
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div
              className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center transition-colors duration-200',
                didCreated
                  ? 'bg-green-500/20 text-green-500 ring-2 ring-green-500/20'
                  : 'bg-muted-foreground/20 text-muted-foreground/40'
              )}
            >
              <Check className="h-3 w-3" />
            </div>
            <span className={cn('text-sm', didCreated ? 'text-green-500' : 'text-muted-foreground')}>
              DID Registered
            </span>
          </div>
        </div>
      </motion.div>

      {/* Status Alerts */}
      <AnimatePresence>
        {!keySaved && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Alert className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20 shadow-lg">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertTitle className="text-amber-600 font-medium">Save Your Private Key</AlertTitle>
              <AlertDescription className="text-amber-600/90">
                You need to save your private key before proceeding. Click "Next" to view and save your private key.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {keySaved && !didCreated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Alert className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20 shadow-lg">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              <AlertTitle className="text-blue-600 font-medium">Register Your DID</AlertTitle>
              <AlertDescription className="text-blue-600/90">
                Your private key is saved. Now you can register your DID on the blockchain.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {didCreated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Alert className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20 shadow-lg">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-600 font-medium">DID Successfully Registered</AlertTitle>
              <AlertDescription className="text-green-600/90">
                Your DID has been successfully registered on the blockchain. You can now proceed to the next step.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <Separator className="my-6" />

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="flex items-center justify-between pt-4"
      >
        <Button variant="ghost" onClick={onCancel} disabled={isProcessing}>
          Cancel
        </Button>
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleRegister}
            disabled={isProcessing || didCreated}
            className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
          >
            {!keySaved && !didCreated && !isProcessing ? (
              <>
                <Key className="mr-2 h-4 w-4" />
                Save Private Key
              </>
            ) : !keySaved && !didCreated && isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : keySaved && !didCreated && !isProcessing ? (
              <>
                <FileKey className="mr-2 h-4 w-4" />
                Register DID
              </>
            ) : keySaved && !didCreated && isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              <>
                <CheckCheck className="mr-2 h-4 w-4" />
                Registered
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
