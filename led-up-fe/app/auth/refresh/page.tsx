'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { refreshAndRedirect } from '@/features/auth';
import { Card } from '@/components/ui/card';

/**
 * This page is used to refresh the token and redirect to the specified URL
 * It's a client component that calls the server action on mount
 */
export default function RefreshPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectParam = searchParams?.get('redirect') || '/dashboard';

  // Prevent redirect loops - don't redirect back to login or refresh pages
  const redirectUrl =
    redirectParam.startsWith('/auth/signin') || redirectParam.startsWith('/auth/refresh')
      ? '/dashboard'
      : redirectParam;

  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(true);

  useEffect(() => {
    const doRefresh = async () => {
      try {
        setIsRefreshing(true);
        // Call the server action to refresh the token and redirect
        await refreshAndRedirect(redirectUrl);
        // If we get here, the redirect didn't happen, so we'll do it manually
        window.location.href = redirectUrl;
      } catch (error) {
        console.error('Error refreshing token:', error);
        setError('Failed to refresh your session. Please try logging in again.');
        setIsRefreshing(false);
        // Wait 3 seconds before redirecting to login
        setTimeout(() => {
          window.location.href = `/auth/signin?redirect=${encodeURIComponent(redirectUrl)}`;
        }, 3000);
      }
    };

    doRefresh();
  }, [redirectUrl, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Card className="text-center max-w-md mx-auto p-6 bg-background rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">{error ? 'Session Error' : 'Refreshing your session...'}</h1>

        {error ? (
          <div className="text-red-500 mb-4">
            <p>{error}</p>
            <p className="text-sm mt-2">Redirecting to login page...</p>
          </div>
        ) : (
          <p className="text-muted-foreground mb-6">Please wait while we restore your session.</p>
        )}

        {isRefreshing && (
          <div className="mt-6 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-8 border-b-8 border-primary"></div>
          </div>
        )}
      </Card>
    </div>
  );
}
