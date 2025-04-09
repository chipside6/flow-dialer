import { useState, useEffect, useRef } from 'react';
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
  const { hasLifetimePlan, isLoading, fetchCurrentSubscription } = useSubscription();
  const navigate = useNavigate();
  const [retryCount, setRetryCount] = useState(0);
  const [hasValidSubscription, setHasValidSubscription] = useState<boolean | null>(null);
  const [hasCheckedSubscription, setHasCheckedSubscription] = useState(false);
  const hasRedirectedRef = useRef(false);
  
  // Determine if the user's subscription status meets requirements
  const subscriptionValid = !requireSubscription || hasLifetimePlan;
  
  // Effect to handle subscription checks with retry logic - only runs once
  useEffect(() => {
    if (isLoading || hasCheckedSubscription) return;
    
    // Log subscription status for debugging
    console.log('Subscription check:', { 
      hasLifetimePlan, 
      subscriptionValid
    });
    
    // Validate subscription in Supabase directly as a double-check
    const validateSubscriptionInDb = async () => {
      try {
        // Only perform this check if our local check indicates no valid subscription
        // This avoids unnecessary DB queries
        if (requireSubscription && !subscriptionValid && retryCount < 3) {
          console.log("Performing database verification of subscription status");
          
          const { data: authData } = await supabase.auth.getSession();
          if (!authData.session) {
            setHasCheckedSubscription(true);
            return;
          }
          
          const { data: subData, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', authData.session.user.id)
            .eq('status', 'active')
            .eq('plan_id', 'lifetime')
            .maybeSingle();
          
          if (error) {
            console.error("Error validating subscription in DB:", error);
            setHasCheckedSubscription(true);
            return;
          }
          
          // If we found an active subscription in the database despite local cache saying no,
          // refetch subscription data to sync local state
          if (subData && !subscriptionValid) {
            console.log("Found valid subscription in database despite cache miss, refetching");
            await fetchCurrentSubscription();
            setRetryCount(prev => prev + 1);
            setHasValidSubscription(!!subData);
          } else {
            // Cache the validated subscription result
            setHasValidSubscription(!!subData);
            setHasCheckedSubscription(true);
          }
        } else {
          setHasCheckedSubscription(true);
        }
      } catch (error) {
        console.error("Error during subscription validation:", error);
        setHasCheckedSubscription(true);
      }
    };
    
    validateSubscriptionInDb();
  }, [
    isLoading, 
    subscriptionValid, 
    requireSubscription, 
    retryCount, 
    fetchCurrentSubscription, 
    hasValidSubscription,
    hasLifetimePlan,
    hasCheckedSubscription
  ]);

  // Handle redirect in a separate effect to avoid render loops
  useEffect(() => {
    if (hasCheckedSubscription && !hasRedirectedRef.current) {
      // Handle redirects after checking subscription status
      if (requireSubscription && !subscriptionValid && (retryCount >= 3 || hasValidSubscription === false)) {
        console.log('User has no lifetime subscription, redirecting to upgrade page');
        hasRedirectedRef.current = true;
        navigate('/upgrade', { replace: true });
      } else if (!requireSubscription && subscriptionValid) {
        console.log('User already has a lifetime subscription, redirecting to dashboard');
        hasRedirectedRef.current = true;
        navigate(redirectTo, { replace: true });
      }
    }
  }, [
    hasCheckedSubscription, 
    requireSubscription, 
    subscriptionValid, 
    retryCount, 
    hasValidSubscription, 
    navigate, 
    redirectTo
  ]);

  // Don't show any loading state - just render children if appropriate
  if (children) {
    return subscriptionValid ? <>{children}</> : null;
  }

  // Otherwise return null (component will handle redirection)
  return null;
}
