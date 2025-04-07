'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Copy,
  AlertCircle,
  CheckCircle,
  Loader2,
  FileText,
  Key,
  FileKey,
  Shield,
  ArrowRight,
  DotSquareIcon,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

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
            <Label className="text-base font-medium flex items-center text-foreground/90">
              <Shield className="h-4 w-4 mr-2 text-primary/80" />
              DID Identifier
            </Label>
          </div>
          <div className="p-3.5 rounded-lg bg-muted/40 border border-border/50 shadow-sm">
            <div className="flex items-center text-sm font-mono py-1 px-3">
              <span className="text-foreground/80 select-all">{didIdentifier}</span>
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
            <Label className="text-base font-medium flex items-center text-foreground/90">
              <Key className="h-4 w-4 mr-2 text-primary/80" />
              Public Key
            </Label>
            <Button
              variant="outline"
              size="sm"
              onClick={onCopyPublicKey}
              className="text-xs h-8 px-3 hover:bg-primary/10 hover:text-primary border-primary/20"
            >
              <Copy className="h-3.5 w-3.5 mr-1.5" />
              Copy
            </Button>
          </div>
          <div className="p-3.5 rounded-lg bg-muted/40 border border-border/50 shadow-sm group transition-all hover:border-primary/30 hover:bg-muted/50">
            <div className="flex items-start space-x-2.5 text-sm font-mono py-1 px-3">
              <span className="text-foreground/80 break-all select-all tracking-tight">{publicKey}</span>
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
          <Label className="text-base font-medium flex items-center text-foreground/90">
            <FileText className="h-4 w-4 mr-2 text-primary/80" />
            DID Document
          </Label>
          <Textarea
            value={didDocument}
            onChange={onDidDocumentChange}
            className="font-mono text-sm h-[220px] bg-muted/40 border-border/50 shadow-sm resize-none focus:border-primary/50 focus:ring-primary/20"
            rows={10}
          />
        </motion.div>
      </div>

      {/* Security Checklist */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="p-5 rounded-lg border border-border/50 bg-gradient-to-br from-card/70 to-card/50 backdrop-blur-sm shadow-sm"
      >
        <Label className="text-base font-medium flex items-center mb-3 text-foreground/90">
          <Shield className="h-4 w-4 mr-2 text-primary/80" />
          Security Checklist
        </Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-3.5">
            <div
              className={cn(
                'flex items-center justify-center transition-colors duration-300 text-muted-foregroundd-foreground mr-2',
                keySaved ? 'bg-green-300 text-green-600' : 'text-muted-foreground'
              )}
            >
              {keySaved ? <CheckCircle className="h-5 w-5" /> : <DotSquareIcon className="h-5 w-5" />}
            </div>
            <span className={cn('text-sm font-medium', keySaved ? 'text-green-600' : 'text-muted-foreground/70')}>
              Private Key Saved
            </span>
          </div>
          <div className="flex items-center space-x-3.5">
            <div
              className={cn(
                'rounded-full flex items-center justify-center transition-colors duration-300 mr-2',
                didCreated ? 'bg-green-300 text-green-600' : 'text-muted-foreground'
              )}
            >
              {didCreated ? <CheckCircle className="h-5 w-5" /> : <DotSquareIcon className="h-5 w-5" />}
            </div>
            <span className={cn('text-sm font-medium', didCreated ? 'text-green-600' : 'text-muted-foreground/70')}>
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
            <Alert className="bg-gradient-to-br from-amber-500/15 to-amber-500/5 border-amber-500/30 shadow-md">
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
            <Alert className="bg-gradient-to-br from-blue-500/15 to-blue-500/5 border-blue-500/30 shadow-md">
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
            <Alert className="bg-gradient-to-br from-green-500/15 to-green-500/5 border-green-500/30 shadow-md">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-600 font-medium">DID Successfully Registered</AlertTitle>
              <AlertDescription className="text-green-600/90">
                Your DID has been successfully registered on the blockchain. You can now proceed to the next step.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <Separator className="my-6 opacity-40" />

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="flex items-center justify-between pt-3"
      >
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="border-border/60 text-muted-foreground hover:text-foreground"
        >
          Cancel
        </Button>
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleRegister}
            disabled={isProcessing || didCreated}
            className={cn(
              'relative bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg transition-all',
              !isProcessing && !didCreated ? 'shadow-primary/20 hover:shadow-primary/30' : '',
              didCreated ? 'bg-green-600 from-green-600 to-green-600/90' : '',
              !isProcessing && didCreated ? 'bg-primary text-foreground hover:bg-primary/90' : ''
            )}
          >
            <span className="relative z-10 flex items-center">
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
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Next
                </>
              )}
            </span>
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
