
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { Loader2 } from 'lucide-react';

interface SubscriptionCheckProps {
  redirectTo: string;
}

export function SubscriptionCheck({ redirectTo }: SubscriptionCheckProps) {
  const { currentPlan, subscription, isLoading } = useSubscription();
  const navigate = useNavigate();
  
  // Check if user has lifetime subscription
  const isLifetimePlan = currentPlan === 'lifetime' || subscription?.plan_id === 'lifetime';

  useEffect(() => {
    // After loading subscription data, check if user has lifetime plan
    if (!isLoading) {
      if (isLifetimePlan) {
        // If user has lifetime plan, redirect them
        console.log('User has lifetime subscription, redirecting to dashboard');
        navigate(redirectTo, { replace: true });
      }
    }
  }, [isLoading, isLifetimePlan, navigate, redirectTo]);

  // While checking subscription status, show loading
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-lg text-muted-foreground">Checking subscription status...</p>
        </div>
      </div>
    );
  }

  // If user doesn't have lifetime access, render the upgrade page
  if (!isLifetimePlan) {
    // This will render the UpgradePage component defined in the route
    return null;
  }

  // This should never render as the user will be redirected
  return null;
}
