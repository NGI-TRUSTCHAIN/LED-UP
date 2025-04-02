'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldAlert, Copy, Check, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface PrivateKeyDialogProps {
  open: boolean;
  privateKey: string;
  onOpenChange: (open: boolean) => void;
  onCopyPrivateKey: () => void;
  onConfirm: () => void;
  className?: string;
}

export function PrivateKeyDialog({
  open,
  privateKey,
  onOpenChange,
  onCopyPrivateKey,
  onConfirm,
  className,
}: PrivateKeyDialogProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleCopyPrivateKey = () => {
    setIsCopied(true);
    onCopyPrivateKey();
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleConfirm = () => {
    setIsConfirming(true);
    setTimeout(() => {
      onConfirm();
      setIsConfirming(false);
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'sm:max-w-md bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-sm border-border/40 shadow-2xl',
          className
        )}
      >
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <DialogHeader className="space-y-4">
            <motion.div
              initial={{ scale: 0.98 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
              className="flex items-center space-x-3"
            >
              <div className="p-2 rounded-xl bg-amber-500/10">
                <ShieldAlert className="h-6 w-6 text-amber-500" />
              </div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
                Save Your Private Key
              </DialogTitle>
            </motion.div>
            <DialogDescription className="text-base text-muted-foreground/90">
              This private key is associated with your DID. Store it securely as it will not be shown again.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-6">
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              <Alert className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 shadow-lg">
                <AlertCircle className="h-5 w-5 text-primary" />
                <AlertTitle className="text-primary font-semibold">Important Security Notice</AlertTitle>
                <AlertDescription className="text-primary/90">
                  Never share this key with anyone. It provides full control over your DID and cannot be recovered if
                  lost.
                </AlertDescription>
              </Alert>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <Label className="text-sm font-medium">Your Private Key:</Label>
              <div className="flex items-center space-x-2">
                <Input
                  readOnly
                  value={privateKey}
                  className="font-mono text-sm bg-muted/50 border-border/40 focus:ring-primary/20 focus:border-primary/30"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyPrivateKey}
                  className={cn(
                    'shrink-0 transition-all duration-200',
                    isCopied
                      ? 'bg-green-500/10 text-green-500 border-green-500/30 hover:bg-green-500/20'
                      : 'hover:bg-primary/10 hover:text-primary hover:border-primary/30'
                  )}
                >
                  <AnimatePresence mode="wait">
                    {isCopied ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Check className="h-4 w-4" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="copy"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Copy className="h-4 w-4" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </div>
            </motion.div>
          </div>

          <DialogFooter>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <Button
                onClick={handleConfirm}
                disabled={isConfirming}
                className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-white shadow-lg shadow-primary/20 disabled:opacity-50 transition-all duration-200"
              >
                {isConfirming ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Confirmed
                  </motion.div>
                ) : (
                  "I've Saved My Private Key"
                )}
              </Button>
            </motion.div>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
