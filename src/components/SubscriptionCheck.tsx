import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/subscription';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionCheckProps {
  redirectTo: string;
  requireSubscription?: boolean;
  children?: React.ReactNode;
}

export function SubscriptionCheck({ 
  redirectTo, 
  requireSubscription = true,
  children 
}: SubscriptionCheckProps) {
  const { currentPlan, subscription, isLoading, refetch } = useSubscription();
  const navigate = useNavigate();
  const [retryCount, setRetryCount] = useState(0);
  const [hasValidSubscription, setHasValidSubscription] = useState<boolean | null>(null);
  
  // Check if user has a valid subscription
  const isLifetimePlan = currentPlan === 'lifetime' || subscription?.plan_id === 'lifetime';
  const isTrialActive = subscription?.plan_id === 'trial' && subscription?.status === 'active';
  const isPaidPlanActive = subscription?.status === 'active' && !isTrialActive && !isLifetimePlan;
  
  // Determine if the user's subscription status meets requirements
  const subscriptionValid = !requireSubscription || isLifetimePlan || isTrialActive || isPaidPlanActive;
  
  // Effect to handle subscription checks with retry logic
  useEffect(() => {
    if (isLoading) return;
    
    // Validate subscription in Supabase directly as a double-check
    const validateSubscriptionInDb = async () => {
      try {
        // Only perform this check if our local check indicates no valid subscription
        // This avoids unnecessary DB queries
        if (requireSubscription && !subscriptionValid && retryCount < 3) {
          console.log("Performing database verification of subscription status");
          
          const { data: authData } = await supabase.auth.getSession();
          if (!authData.session) return;
          
          const { data: subData, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', authData.session.user.id)
            .eq('status', 'active')
            .maybeSingle();
          
          if (error) {
            console.error("Error validating subscription in DB:", error);
            return;
          }
          
          // If we found an active subscription in the database despite local cache saying no,
          // refetch subscription data to sync local state
          if (subData && !subscriptionValid) {
            console.log("Found valid subscription in database despite cache miss, refetching");
            refetch();
            setRetryCount(prev => prev + 1);
            return;
          }
          
          // Cache the validated subscription result
          setHasValidSubscription(!!subData);
        }
      } catch (error) {
        console.error("Error during subscription validation:", error);
      }
    };
    
    validateSubscriptionInDb();
    
    // After loading subscription data, check if redirection is needed
    if (!isLoading) {
      if (requireSubscription && !subscriptionValid) {
        // The user needs a subscription but doesn't have one
        if (retryCount >= 3 || hasValidSubscription === false) {
          console.log('User has no valid subscription, redirecting to upgrade page');
          navigate('/upgrade', { replace: true });
        }
      } else if (!requireSubscription && subscriptionValid) {
        // The user already has a subscription and is on a page that doesn't require one (like upgrade)
        console.log('User already has a subscription, redirecting to dashboard');
        navigate(redirectTo, { replace: true });
      }
    }
  }, [
    isLoading, 
    subscriptionValid, 
    requireSubscription, 
    navigate, 
    redirectTo, 
    retryCount, 
    refetch, 
    hasValidSubscription
  ]);

  // While checking subscription status, show loading
  if (isLoading || (requireSubscription && !subscriptionValid && retryCount < 3 && hasValidSubscription === null)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-lg text-muted-foreground">Verifying subscription status...</p>
        </div>
      </div>
    );
  }

  // If children are provided, render them when subscription is valid
  if (children) {
    return subscriptionValid ? <>{children}</> : null;
  }

  // Otherwise return null (component will handle redirection)
  return null;
}
