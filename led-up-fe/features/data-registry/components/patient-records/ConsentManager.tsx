'use client';
import { useUpdateProducerConsent, useProducerMetadata } from '../../hooks/use-data-registry';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useSonner } from '@/hooks/use-sonner';
import { ConsentStatus } from '../../types/contract';
import { CheckCircle2, XCircle, HelpCircle, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/contexts/auth-provider';

const consentStatusConfig = {
  [ConsentStatus.Allowed]: {
    icon: CheckCircle2,
    label: 'Allowed',
    variant: 'outline' as const,
    description: 'You can share data with consumers',
  },
  [ConsentStatus.Denied]: {
    icon: XCircle,
    label: 'Denied',
    variant: 'destructive' as const,
    description: 'Data sharing is blocked',
  },
  [ConsentStatus.NotSet]: {
    icon: HelpCircle,
    label: 'Not Set',
    variant: 'secondary' as const,
    description: 'Consent status not set',
  },
} as const;

export function ConsentManager() {
  const { address } = useAuth();
  const { toast } = useSonner();
  const updateConsent = useUpdateProducerConsent();
  const { data: producerMetadata, isLoading: isLoadingMetadata } = useProducerMetadata(address as `0x${string}`);
  console.log('producerMetadata', producerMetadata);

  const handleUpdateConsent = async (status: ConsentStatus) => {
    if (!address) {
      toast.error('Please connect your wallet first.');
      return;
    }

    try {
      const result = await updateConsent.mutateAsync({
        producer: address as `0x${string}`,
        consentStatus: status,
      });

      if (result.success) {
        toast.success(`Consent status updated to ${consentStatusConfig[status].label}`);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error('Failed to update consent');
    }
  };

  // Get current status from producer metadata
  const currentStatus = producerMetadata?.consent ?? ConsentStatus.NotSet;
  const currentConfig = consentStatusConfig[currentStatus];
  const StatusIcon = currentConfig.icon;

  if (!address) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={currentConfig.variant}
          size="sm"
          className={cn(
            'border-primary flex items-center gap-2 pr-3 rounded-full h-9 my-auto',
            (updateConsent.isPending || isLoadingMetadata) && 'opacity-50 cursor-not-allowed'
          )}
          disabled={updateConsent.isPending || isLoadingMetadata}
        >
          {isLoadingMetadata ? <Loader2 className="h-4 w-4 animate-spin" /> : <StatusIcon className="h-4 w-4" />}
          <span>Consent: {isLoadingMetadata ? 'Loading...' : currentConfig.label}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="end">
        <div className="flex flex-col gap-1">
          {Object.entries(consentStatusConfig).map(([status, config]) => {
            const Icon = config.icon;
            const isActive = Number(status) === currentStatus;
            return (
              <Button
                key={status}
                variant={isActive ? config.variant : 'ghost'}
                size="sm"
                className={cn('w-full justify-start gap-2', isActive && 'font-medium')}
                onClick={() => handleUpdateConsent(Number(status) as ConsentStatus)}
                disabled={updateConsent.isPending || isLoadingMetadata}
              >
                <Icon className="h-4 w-4" />
                <span>{config.label}</span>
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
