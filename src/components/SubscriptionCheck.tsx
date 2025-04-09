import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/subscription';
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
  const { currentPlan, subscription, isLoading, fetchCurrentSubscription } = useSubscription();
  const navigate = useNavigate();
  const [retryCount, setRetryCount] = useState(0);
  const [hasValidSubscription, setHasValidSubscription] = useState<boolean | null>(null);
  const hasRedirectedRef = useRef(false);
  
  // Check if user has a valid subscription - explicitly check for lifetime plan
  const isLifetimePlan = currentPlan === 'lifetime' || subscription?.plan_id === 'lifetime';
  
  // Determine if the user's subscription status meets requirements
  const subscriptionValid = !requireSubscription || isLifetimePlan;
  
  // Memoize this function to prevent recreation on each render
  const validateSubscriptionInDb = useCallback(async () => {
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
          .eq('plan_id', 'lifetime')
          .maybeSingle();
        
        if (error) {
          console.error("Error validating subscription in DB:", error);
          return;
        }
        
        // If we found an active subscription in the database despite local cache saying no,
        // refetch subscription data to sync local state
        if (subData && !subscriptionValid) {
          console.log("Found valid subscription in database despite cache miss, refetching");
          fetchCurrentSubscription();
          setRetryCount(prev => prev + 1);
          return;
        }
        
        // Cache the validated subscription result
        setHasValidSubscription(!!subData);
      }
    } catch (error) {
      console.error("Error during subscription validation:", error);
    }
  }, [requireSubscription, subscriptionValid, retryCount, fetchCurrentSubscription]);
  
  // Effect to handle subscription checks with retry logic
  useEffect(() => {
    if (isLoading) return;
    
    validateSubscriptionInDb();
    
    // After loading subscription data, check if redirection is needed
    if (!isLoading && !hasRedirectedRef.current) {
      if (requireSubscription && !subscriptionValid) {
        // The user needs a subscription but doesn't have one
        if (retryCount >= 3 || hasValidSubscription === false) {
          console.log('User has no lifetime subscription, redirecting to upgrade page');
          hasRedirectedRef.current = true;
          navigate('/upgrade', { replace: true });
        }
      } else if (!requireSubscription && subscriptionValid) {
        // The user already has a subscription and is on a page that doesn't require one (like upgrade)
        console.log('User already has a lifetime subscription, redirecting to dashboard');
        hasRedirectedRef.current = true;
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
    hasValidSubscription,
    validateSubscriptionInDb
  ]);

  // Don't show any loading state - just render children if appropriate
  if (children) {
    return subscriptionValid ? <>{children}</> : null;
  }

  // Otherwise return null (component will handle redirection)
  return null;
}
