'use client';

import { Button } from '@/components/ui/button';
import { UserCheck, Users, Building2, ArrowRight, UserCircle, Database } from 'lucide-react';
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
import { cn } from '@/lib/utils';

interface UserRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectRole: (role: 'consumer' | 'producer') => void;
  className?: string;
}

export function UserRoleDialog({ open, onOpenChange, onSelectRole }: UserRoleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-card/95 border border-border/40 shadow-xl backdrop-blur-md">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary/90 via-primary to-primary/90 bg-clip-text text-transparent">
            Choose Your Role in LED-UP
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground/90">
            Select how you would like to participate in the LED-UP ecosystem
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Consumer Role Card */}
          <Card
            onClick={() => onSelectRole('consumer')}
            className="group relative p-6 rounded-xl border border-border/60 bg-card hover:bg-accent/5 hover:border-primary/20 transition-all duration-200 cursor-pointer"
          >
            <div className="absolute top-0 right-0 p-3">
              <div className="w-2 h-2 rounded-full bg-blue-500/40 group-hover:bg-blue-500 transition-colors duration-200" />
            </div>
            <div className="space-y-4">
              <div className="p-2.5 w-fit rounded-lg bg-blue-500/10 text-blue-600">
                <Users className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Consumer</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Access and utilize data from the LED-UP network. Perfect for organizations needing reliable data
                  access.
                </p>
              </div>
              <div className="pt-2">
                <Button
                  variant="outline"
                  className="w-full border-blue-500/20 hover:bg-blue-500/10 hover:text-blue-600 group-hover:border-blue-500/30"
                >
                  <UserCircle className="h-4 w-4 mr-2" />
                  Select Consumer Role
                </Button>
              </div>
            </div>
          </Card>

          {/* Producer Role Card */}
          <Card
            onClick={() => onSelectRole('producer')}
            className="group relative p-6 rounded-xl border border-border/60 bg-card hover:bg-accent/5 hover:border-primary/20 transition-all duration-200 cursor-pointer"
          >
            <div className="absolute top-0 right-0 p-3">
              <div className="w-2 h-2 rounded-full bg-green-500/40 group-hover:bg-green-500 transition-colors duration-200" />
            </div>
            <div className="space-y-4">
              <div className="p-2.5 w-fit rounded-lg bg-green-500/10 text-green-600">
                <Database className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Producer</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Contribute data to the LED-UP network. Ideal for organizations with valuable data to share.
                </p>
              </div>
              <div className="pt-2">
                <Button
                  variant="outline"
                  className="w-full border-green-500/20 hover:bg-green-500/10 hover:text-green-600 group-hover:border-green-500/30"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Select Producer Role
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="border-border/60">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
