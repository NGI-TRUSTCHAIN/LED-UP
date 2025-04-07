'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSonner } from '@/hooks/use-sonner';
import { Separator } from '@/components/ui/separator';
import { Loader2, AlertCircle, CheckCircle, Settings2, BanknoteIcon, BadgePercent, PauseCircle } from 'lucide-react';
import { formatTokenAmount } from '@/lib/utils';
import {
  useServiceFee,
  useUnitPrice,
  useMinimumWithdrawAmount,
  useChangeServiceFee,
  useChangeUnitPrice,
  useSetMinimumWithdrawAmount,
  usePauseService,
  useUnpauseService,
  useIsPaused,
} from '../hooks';
import { ServiceFeeSchema, UnitPriceSchema, MinWithdrawalAmountSchema } from '../schema';
import { z } from 'zod';

/**
 * AdminControlPanel component displays admin controls for the compensation system
 */
export function AdminControlPanel() {
  const [activeTab, setActiveTab] = useState('fees');
  const { toast } = useSonner();

  // Service status
  const { data: isPaused, isLoading: isStatusLoading } = useIsPaused();

  // Data queries
  const { data: serviceFee, isLoading: isServiceFeeLoading } = useServiceFee();
  const { data: unitPrice, isLoading: isUnitPriceLoading } = useUnitPrice();
  const { data: minimumWithdrawAmount, isLoading: isMinWithdrawLoading } = useMinimumWithdrawAmount();

  // Mutation hooks
  const { mutateAsync: changeServiceFee, isPending: isChangingServiceFee } = useChangeServiceFee();
  const { mutateAsync: changeUnitPrice, isPending: isChangingUnitPrice } = useChangeUnitPrice();
  const { mutateAsync: setMinimumWithdrawAmount, isPending: isSettingMinWithdraw } = useSetMinimumWithdrawAmount();
  const { mutateAsync: pauseService, isPending: isPausingService } = usePauseService();
  const { mutateAsync: unpauseService, isPending: isUnpausingService } = useUnpauseService();

  // Form states
  const [serviceFeeFormStatus, setServiceFeeFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [unitPriceFormStatus, setUnitPriceFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [minWithdrawFormStatus, setMinWithdrawFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>(
    'idle'
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Service fee form setup
  const serviceFeeForm = useForm<z.infer<typeof ServiceFeeSchema>>({
    resolver: zodResolver(ServiceFeeSchema),
    defaultValues: {
      fee: serviceFee ? (Number(serviceFee) / 100).toString() : '',
    },
  });

  // Unit price form setup
  const unitPriceForm = useForm<z.infer<typeof UnitPriceSchema>>({
    resolver: zodResolver(UnitPriceSchema),
    defaultValues: {
      price: unitPrice ? formatTokenAmount(unitPrice, 18, '') : '',
    },
  });

  // Minimum withdrawal amount form setup
  const minWithdrawForm = useForm<z.infer<typeof MinWithdrawalAmountSchema>>({
    resolver: zodResolver(MinWithdrawalAmountSchema),
    defaultValues: {
      amount: minimumWithdrawAmount ? formatTokenAmount(minimumWithdrawAmount, 18, '') : '',
    },
  });

  // Update form default values when data is loaded
  useState(() => {
    if (serviceFee !== undefined) {
      serviceFeeForm.setValue('fee', (Number(serviceFee) / 100).toString());
    }
    if (unitPrice !== undefined) {
      unitPriceForm.setValue('price', formatTokenAmount(unitPrice, 18, ''));
    }
    if (minimumWithdrawAmount !== undefined) {
      minWithdrawForm.setValue('amount', formatTokenAmount(minimumWithdrawAmount, 18, ''));
    }
  });

  // Handle service fee form submission
  const onServiceFeeSubmit = async (values: z.infer<typeof ServiceFeeSchema>) => {
    try {
      setServiceFeeFormStatus('submitting');
      setErrorMessage(null);

      // Convert percentage to basis points (multiply by 100)
      const newFeePercentage = Math.floor(parseFloat(values.fee) * 100);

      await changeServiceFee({
        newFee: newFeePercentage,
      });

      setServiceFeeFormStatus('success');

      toast.success('Service Fee Updated', {
        description: `Service fee has been updated to ${values.fee}%`,
      });

      // Reset status after 3 seconds
      setTimeout(() => {
        setServiceFeeFormStatus('idle');
      }, 3000);
    } catch (error) {
      setServiceFeeFormStatus('error');
      const errorMsg = error instanceof Error ? error.message : 'An unknown error occurred';
      setErrorMessage(errorMsg);

      toast.error('Update Failed', {
        description: errorMsg,
      });
    }
  };

  // Handle unit price form submission
  const onUnitPriceSubmit = async (values: z.infer<typeof UnitPriceSchema>) => {
    try {
      setUnitPriceFormStatus('submitting');
      setErrorMessage(null);

      // Convert to token units (with 18 decimals)
      const newUnitPrice = BigInt(Math.floor(parseFloat(values.price) * 10 ** 18));

      await changeUnitPrice({
        newPrice: newUnitPrice,
      });

      setUnitPriceFormStatus('success');

      toast.success('Unit Price Updated', {
        description: `Unit price has been updated to ${values.price} LDTK`,
      });

      // Reset status after 3 seconds
      setTimeout(() => {
        setUnitPriceFormStatus('idle');
      }, 3000);
    } catch (error) {
      setUnitPriceFormStatus('error');
      const errorMsg = error instanceof Error ? error.message : 'An unknown error occurred';
      setErrorMessage(errorMsg);

      toast.error('Update Failed', {
        description: errorMsg,
      });
    }
  };

  // Handle minimum withdrawal amount form submission
  const onMinWithdrawSubmit = async (values: z.infer<typeof MinWithdrawalAmountSchema>) => {
    try {
      setMinWithdrawFormStatus('submitting');
      setErrorMessage(null);

      // Convert to token units (with 18 decimals)
      const newMinAmount = BigInt(Math.floor(parseFloat(values.amount) * 10 ** 18));

      await setMinimumWithdrawAmount({
        newAmount: newMinAmount,
      });

      setMinWithdrawFormStatus('success');

      toast.success('Minimum Withdrawal Updated', {
        description: `Minimum withdrawal amount has been updated to ${values.amount} LDTK`,
      });

      // Reset status after 3 seconds
      setTimeout(() => {
        setMinWithdrawFormStatus('idle');
      }, 3000);
    } catch (error) {
      setMinWithdrawFormStatus('error');
      const errorMsg = error instanceof Error ? error.message : 'An unknown error occurred';
      setErrorMessage(errorMsg);

      toast.error('Update Failed', {
        description: errorMsg,
      });
    }
  };

  // Handle system pause/unpause toggle
  const handlePauseToggle = async (checked: boolean) => {
    try {
      if (checked) {
        // Unpause the service
        await unpauseService();
        toast.success('Service Activated', {
          description: 'The compensation service has been activated',
        });
      } else {
        // Pause the service
        await pauseService();
        toast.success('Service Paused', {
          description: 'The compensation service has been paused',
        });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error('Operation Failed', {
        description: errorMsg,
      });
    }
  };

  const isLoading =
    isServiceFeeLoading ||
    isUnitPriceLoading ||
    isMinWithdrawLoading ||
    isChangingServiceFee ||
    isChangingUnitPrice ||
    isSettingMinWithdraw ||
    isStatusLoading ||
    isPausingService ||
    isUnpausingService;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          Admin Control Panel
        </CardTitle>
        <CardDescription>Manage compensation service settings and parameters</CardDescription>
      </CardHeader>
      <Tabs defaultValue="fees" value={activeTab} onValueChange={setActiveTab}>
        <CardContent className="p-0">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="fees">Fee Settings</TabsTrigger>
            <TabsTrigger value="system">System Controls</TabsTrigger>
          </TabsList>
        </CardContent>

        <CardContent className="pt-4 pb-0">
          <TabsContent value="fees" className="space-y-4">
            {/* Service Fee Form */}
            <Form {...serviceFeeForm}>
              <form onSubmit={serviceFeeForm.handleSubmit(onServiceFeeSubmit)} className="space-y-4">
                <FormField
                  control={serviceFeeForm.control}
                  name="fee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <BadgePercent className="h-4 w-4" />
                        Service Fee Percentage
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="0.00"
                            {...field}
                            disabled={isServiceFeeLoading || serviceFeeFormStatus === 'submitting'}
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <span className="text-sm text-muted-foreground">%</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>The percentage fee charged by the system on each payment</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button type="submit" disabled={isServiceFeeLoading || serviceFeeFormStatus === 'submitting'}>
                    {serviceFeeFormStatus === 'submitting' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : serviceFeeFormStatus === 'success' ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                        Updated
                      </>
                    ) : (
                      'Update Service Fee'
                    )}
                  </Button>
                </div>
              </form>
            </Form>

            <Separator className="my-4" />

            {/* Unit Price Form */}
            <Form {...unitPriceForm}>
              <form onSubmit={unitPriceForm.handleSubmit(onUnitPriceSubmit)} className="space-y-4">
                <FormField
                  control={unitPriceForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <BanknoteIcon className="h-4 w-4" />
                        Unit Price
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="0.00"
                            {...field}
                            disabled={isUnitPriceLoading || unitPriceFormStatus === 'submitting'}
                            type="number"
                            step="0.000001"
                            min="0"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <span className="text-sm text-muted-foreground">LDTK</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>The price per unit for data records</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button type="submit" disabled={isUnitPriceLoading || unitPriceFormStatus === 'submitting'}>
                    {unitPriceFormStatus === 'submitting' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : unitPriceFormStatus === 'success' ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                        Updated
                      </>
                    ) : (
                      'Update Unit Price'
                    )}
                  </Button>
                </div>
              </form>
            </Form>

            <Separator className="my-4" />

            {/* Minimum Withdrawal Amount Form */}
            <Form {...minWithdrawForm}>
              <form onSubmit={minWithdrawForm.handleSubmit(onMinWithdrawSubmit)} className="space-y-4">
                <FormField
                  control={minWithdrawForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <BanknoteIcon className="h-4 w-4" />
                        Minimum Withdrawal Amount
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="0.00"
                            {...field}
                            disabled={isMinWithdrawLoading || minWithdrawFormStatus === 'submitting'}
                            type="number"
                            step="0.000001"
                            min="0"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <span className="text-sm text-muted-foreground">LDTK</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>The minimum amount that producers can withdraw</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button type="submit" disabled={isMinWithdrawLoading || minWithdrawFormStatus === 'submitting'}>
                    {minWithdrawFormStatus === 'submitting' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : minWithdrawFormStatus === 'success' ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                        Updated
                      </>
                    ) : (
                      'Update Minimum'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <PauseCircle className="h-4 w-4" />
                    System Status
                  </CardTitle>
                  <CardDescription>Control whether the compensation service is active</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Service Status</p>
                      <p className="text-sm text-muted-foreground">
                        {isStatusLoading
                          ? 'Loading status...'
                          : isPaused === true
                          ? 'Service is currently paused'
                          : isPaused === false
                          ? 'Service is currently active'
                          : 'Unknown status'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground mr-2">{isPaused ? 'Paused' : 'Active'}</span>
                      <Switch
                        checked={isPaused === false}
                        onCheckedChange={handlePauseToggle}
                        disabled={isStatusLoading || isPausingService || isUnpausingService}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Error Alert */}
              {errorMessage && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}
