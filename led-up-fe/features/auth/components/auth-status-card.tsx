'use client';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Key, Power, FileKey, CheckCircle, AlertCircle, Wallet } from 'lucide-react';
import ConnectButton from '@/components/wallet-connect';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthStatusCardProps {
  isConnected: boolean;
  address?: string;
  isAuthenticated: boolean;
  authDid?: string;
  existingDid?: string;
  isLoading: boolean;
  isLoadingDid: boolean;
  isProcessing: boolean;
  didCreated: boolean;
  onDisconnect: () => void;
}

export function AuthStatusCard({
  isConnected,
  address,
  isAuthenticated,
  authDid,
  existingDid,
  isLoading,
  isLoadingDid,
  isProcessing,
  didCreated,
  onDisconnect,
}: AuthStatusCardProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="space-y-6">
      {/* Connection Status */}
      <motion.div
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="relative overflow-hidden rounded-lg border border-border/60 bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-sm shadow-lg"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
        <div className="relative p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={cn(
                  'w-3 h-3 rounded-full transition-colors duration-300',
                  isConnected ? 'bg-green-500 shadow-lg shadow-green-500/20' : 'bg-muted-foreground/30'
                )}
              />
              <span className="font-medium text-sm">{isConnected ? 'Wallet Connected' : 'Wallet Not Connected'}</span>
            </div>
            <AnimatePresence mode="wait">
              {isConnected ? (
                <motion.div
                  key="disconnect"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDisconnect}
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-colors duration-200"
                  >
                    <Power className="h-4 w-4 mr-2" />
                    Disconnect
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="connect"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <ConnectButton />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {isConnected && address && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-3 rounded-md bg-gradient-to-br from-muted/50 to-muted/30 border border-border/40 backdrop-blur-sm">
                  <div className="flex items-center space-x-2 text-sm font-mono">
                    <Wallet className="h-3.5 w-3.5 text-primary" />
                    <span className="truncate text-muted-foreground">{address}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* DID Status */}
      <AnimatePresence mode="wait">
        {isConnected && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {isLoading || isLoadingDid || isProcessing ? (
              <motion.div
                initial={{ scale: 0.98 }}
                animate={{ scale: 1 }}
                className="p-4 rounded-lg border border-border/60 bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-sm shadow-lg"
              >
                <div className="flex items-center space-x-3">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-muted-foreground">
                    {isProcessing ? 'Processing...' : 'Loading DID status...'}
                  </span>
                </div>
              </motion.div>
            ) : existingDid || didCreated ? (
              <motion.div
                initial={{ scale: 0.98 }}
                animate={{ scale: 1 }}
                className="p-4 rounded-lg border border-border/60 bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-sm shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/20" />
                    <span className="font-medium text-sm">DID Found</span>
                  </div>
                  <div className="p-3 rounded-md bg-gradient-to-br from-muted/50 to-muted/30 border border-border/40 backdrop-blur-sm">
                    <div className="flex items-center space-x-2 text-sm font-mono">
                      <FileKey className="h-3.5 w-3.5 text-primary" />
                      <span className="truncate text-muted-foreground">{existingDid || authDid}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0.98 }}
                animate={{ scale: 1 }}
                className="p-4 rounded-lg border border-border/60 bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-sm shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <span className="text-muted-foreground text-sm">No DID found for this address</span>
                  </div>
                </div>
              </motion.div>
            )}

            <AnimatePresence>
              {isAuthenticated && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Alert className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20 shadow-lg">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertTitle className="text-green-600 font-medium">Successfully Authenticated</AlertTitle>
                    <AlertDescription className="text-green-600/90">
                      You are now securely logged in with your DID.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
