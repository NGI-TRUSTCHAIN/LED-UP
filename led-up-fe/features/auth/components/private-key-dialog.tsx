'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldAlert, Copy, Check, AlertCircle, Key, Shield } from 'lucide-react';
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
          'sm:max-w-md bg-gradient-to-br from-background/97 to-background/95 backdrop-blur-md border-border/50 shadow-xl rounded-xl overflow-hidden',
          className
        )}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          {/* Decorative elements */}
          <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl opacity-70" />
            <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-primary/10 rounded-full blur-3xl opacity-70" />
          </div>

          <DialogHeader className="space-y-4 relative z-10">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex items-center space-x-3"
            >
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 ring-1 ring-amber-500/30">
                <ShieldAlert className="h-6 w-6 text-amber-500" />
              </div>
              <DialogTitle className="text-2xl font-bold tracking-tight bg-gradient-to-br from-amber-500 via-amber-600 to-amber-500 bg-clip-text text-transparent">
                Save Your Private Key
              </DialogTitle>
            </motion.div>
            <DialogDescription className="text-base text-muted-foreground/90 max-w-[90%]">
              This private key is associated with your DID. Store it securely as it will not be shown again.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Alert className="bg-gradient-to-br from-amber-500/15 to-amber-500/5 border-amber-500/30 shadow-md">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <AlertTitle className="text-amber-700 font-medium">Important Security Notice</AlertTitle>
                <AlertDescription className="text-amber-700/90">
                  Never share this key with anyone. It provides full control over your DID and cannot be recovered if
                  lost.
                </AlertDescription>
              </Alert>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="space-y-3"
            >
              <Label className="text-sm font-medium flex items-center gap-2">
                <Key className="h-4 w-4 text-primary/80" />
                Your Private Key:
              </Label>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Input
                    readOnly
                    value={privateKey}
                    className="font-mono text-sm bg-muted/40 border-border/50 focus:ring-primary/20 focus:border-primary/30 pr-10 shadow-sm"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Shield className="h-4 w-4 text-muted-foreground/50" />
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyPrivateKey}
                  className={cn(
                    'shrink-0 transition-all duration-300 border-border/60 shadow-sm',
                    isCopied
                      ? 'bg-green-500/15 text-green-600 border-green-500/30 hover:bg-green-500/20 ring-1 ring-green-500/20'
                      : 'hover:bg-primary/10 hover:text-primary hover:border-primary/40'
                  )}
                >
                  <AnimatePresence mode="wait">
                    {isCopied ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.2, type: 'spring' }}
                      >
                        <Check className="h-4 w-4" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="copy"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.2, type: 'spring' }}
                      >
                        <Copy className="h-4 w-4" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </div>
            </motion.div>
          </div>

          <DialogFooter className="relative z-10 mt-2">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="w-full"
            >
              <Button
                onClick={handleConfirm}
                disabled={isConfirming}
                className={cn(
                  'w-full relative overflow-hidden group',
                  isConfirming
                    ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-600 hover:to-green-500 shadow-lg shadow-green-500/20'
                    : 'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg shadow-primary/20'
                )}
              >
                <span className="absolute inset-0 w-full h-full bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0)_100%)] animate-[shine_3s_ease_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                {isConfirming ? (
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Confirmed
                  </motion.div>
                ) : (
                  <span className="flex items-center">
                    <Shield className="mr-2 h-4 w-4" />
                    I've Saved My Private Key
                  </span>
                )}
              </Button>
            </motion.div>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
