'use client';

import { Button } from '@/components/ui/button';
import { UserCheck, Users, Building2, ArrowRight, UserCircle, Database, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Role } from '@/features/did-auth/actions/mutation';

interface UserRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectRole: (role: Role) => void;
  className?: string;
}

export function UserRoleDialog({ open, onOpenChange, onSelectRole }: UserRoleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl w-full md:w-5/6 lg:w-4/5 xl:w-3/5 bg-gradient-to-br from-background/97 to-background/95 border border-border/50 shadow-xl backdrop-blur-md rounded-xl overflow-hidden p-0">
        <div className="relative">
          {/* Decorative elements */}
          <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl opacity-70" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/10 rounded-full blur-3xl opacity-70" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-24 bg-gradient-to-r from-transparent via-primary/5 to-transparent rotate-12 opacity-40" />
          </div>

          <div className="relative z-10 p-6">
            <DialogHeader className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <DialogTitle className="text-2xl font-bold tracking-tight bg-gradient-to-br from-primary/90 via-primary to-primary/90 bg-clip-text text-transparent pb-1">
                  Choose Your Role in LED-UP
                </DialogTitle>
                <DialogDescription className="text-base text-muted-foreground/90">
                  Select how you would like to participate in the LED-UP ecosystem
                </DialogDescription>
              </motion.div>
            </DialogHeader>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6"
            >
              {/* Admin Role Card */}
              <Card
                onClick={() => onSelectRole('admin')}
                className="group relative p-6 rounded-xl border border-border/50 bg-card hover:bg-accent/5 hover:border-green-500/30 hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="absolute top-0 right-0 p-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/40 group-hover:bg-green-500 transition-colors duration-300 ring-4 ring-green-500/10 group-hover:ring-green-500/20" />
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="p-3 w-fit rounded-lg bg-gradient-to-br from-green-500/15 to-green-500/5 text-green-600 ring-1 ring-green-500/20 group-hover:ring-green-500/30 transition-all duration-300 group-hover:scale-105 group-hover:shadow-sm">
                    <Database className="h-6 w-6" />
                  </div>
                  <div className="space-y-2.5">
                    <h3 className="text-xl font-semibold text-foreground group-hover:text-green-700 transition-colors duration-300">
                      Admin
                    </h3>
                    <p className="text-sm text-muted-foreground/90 leading-relaxed">
                      Manage the LED-UP network. Ideal for organizations with valuable data to share.
                    </p>
                  </div>
                  <div className="pt-3">
                    <Button
                      variant="outline"
                      className="w-full border-green-500/20 bg-green-500/5 hover:bg-green-500/10 hover:text-green-600 group-hover:border-green-500/40 transition-all duration-300"
                    >
                      <Building2 className="h-4 w-4 mr-2" />
                      <span>Select Admin Role</span>
                      <CheckCircle2 className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Button>
                  </div>
                </div>
              </Card>
              {/* Provider Role Card */}
              <Card
                onClick={() => onSelectRole('provider')}
                className="group relative p-6 rounded-xl border border-border/50 bg-card hover:bg-accent/5 hover:border-green-500/30 hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="absolute top-0 right-0 p-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/40 group-hover:bg-green-500 transition-colors duration-300 ring-4 ring-green-500/10 group-hover:ring-green-500/20" />
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="p-3 w-fit rounded-lg bg-gradient-to-br from-green-500/15 to-green-500/5 text-green-600 ring-1 ring-green-500/20 group-hover:ring-green-500/30 transition-all duration-300 group-hover:scale-105 group-hover:shadow-sm">
                    <Database className="h-6 w-6" />
                  </div>
                  <div className="space-y-2.5">
                    <h3 className="text-xl font-semibold text-foreground group-hover:text-green-700 transition-colors duration-300">
                      Provider
                    </h3>
                    <p className="text-sm text-muted-foreground/90 leading-relaxed">
                      Provide services to the LED-UP network. Ideal for organizations with valuable services to share.
                    </p>
                  </div>
                  <div className="pt-3">
                    <Button
                      variant="outline"
                      className="w-full border-green-500/20 bg-green-500/5 hover:bg-green-500/10 hover:text-green-600 group-hover:border-green-500/40 transition-all duration-300"
                    >
                      <Building2 className="h-4 w-4 mr-2" />
                      <span>Select Provider Role</span>
                      <CheckCircle2 className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Button>
                  </div>
                </div>
              </Card>
              {/* Producer Role Card */}
              <Card
                onClick={() => onSelectRole('producer')}
                className="group relative p-6 rounded-xl border border-border/50 bg-card hover:bg-accent/5 hover:border-green-500/30 hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="absolute top-0 right-0 p-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/40 group-hover:bg-green-500 transition-colors duration-300 ring-4 ring-green-500/10 group-hover:ring-green-500/20" />
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="p-3 w-fit rounded-lg bg-gradient-to-br from-green-500/15 to-green-500/5 text-green-600 ring-1 ring-green-500/20 group-hover:ring-green-500/30 transition-all duration-300 group-hover:scale-105 group-hover:shadow-sm">
                    <Database className="h-6 w-6" />
                  </div>
                  <div className="space-y-2.5">
                    <h3 className="text-xl font-semibold text-foreground group-hover:text-green-700 transition-colors duration-300">
                      Producer
                    </h3>
                    <p className="text-sm text-muted-foreground/90 leading-relaxed">
                      Contribute data to the LED-UP network. Ideal for organizations with valuable data to share.
                    </p>
                  </div>
                  <div className="pt-3">
                    <Button
                      variant="outline"
                      className="w-full border-green-500/20 bg-green-500/5 hover:bg-green-500/10 hover:text-green-600 group-hover:border-green-500/40 transition-all duration-300"
                    >
                      <Building2 className="h-4 w-4 mr-2" />
                      <span>Select Producer Role</span>
                      <CheckCircle2 className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Consumer Role Card */}
              <Card
                onClick={() => onSelectRole('consumer')}
                className="group relative p-6 rounded-xl border border-border/50 bg-card hover:bg-accent/5 hover:border-blue-500/30 hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="absolute top-0 right-0 p-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500/40 group-hover:bg-blue-500 transition-colors duration-300 ring-4 ring-blue-500/10 group-hover:ring-blue-500/20" />
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="p-3 w-fit rounded-lg bg-gradient-to-br from-blue-500/15 to-blue-500/5 text-blue-600 ring-1 ring-blue-500/20 group-hover:ring-blue-500/30 transition-all duration-300 group-hover:scale-105 group-hover:shadow-sm">
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="space-y-2.5">
                    <h3 className="text-xl font-semibold text-foreground group-hover:text-blue-700 transition-colors duration-300">
                      Consumer
                    </h3>
                    <p className="text-sm text-muted-foreground/90 leading-relaxed">
                      Access and utilize data from the LED-UP network. Perfect for organizations needing reliable data
                      access.
                    </p>
                  </div>
                  <div className="pt-3">
                    <Button
                      variant="outline"
                      className="w-full border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 hover:text-blue-600 group-hover:border-blue-500/40 transition-all duration-300"
                    >
                      <UserCircle className="h-4 w-4 mr-2" />
                      <span>Select Consumer Role</span>
                      <CheckCircle2 className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.2 }}>
              <DialogFooter className="pt-2">
                <DialogClose asChild>
                  <Button
                    variant="outline"
                    className="border-border/60 text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    Cancel
                  </Button>
                </DialogClose>
              </DialogFooter>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
