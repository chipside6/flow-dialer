
import React, { createContext, useContext, useState, useEffect } from 'react';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  isPopular?: boolean;
}

interface PricingContextType {
  plans: PricingPlan[];
  isLoading: boolean;
  error: Error | null;
}

const PricingContext = createContext<PricingContextType>({
  plans: [],
  isLoading: false,
  error: null
});

export const usePricing = () => useContext(PricingContext);

export const PricingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        // Simulate fetching pricing plans from an API
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data
        const pricingPlans: PricingPlan[] = [
          {
            id: 'basic',
            name: 'Basic',
            price: 9.99,
            billingCycle: 'monthly',
            features: [
              '100 campaign minutes',
              'Basic reporting',
              'Email support'
            ]
          },
          {
            id: 'pro',
            name: 'Professional',
            price: 29.99,
            billingCycle: 'monthly',
            isPopular: true,
            features: [
              '500 campaign minutes',
              'Advanced reporting',
              'Priority support',
              'Custom greetings'
            ]
          },
          {
            id: 'enterprise',
            name: 'Enterprise',
            price: 99.99,
            billingCycle: 'monthly',
            features: [
              'Unlimited campaign minutes',
              'Full analytics suite',
              'Dedicated account manager',
              'Custom integrations',
              'API access'
            ]
          }
        ];
        
        setPlans(pricingPlans);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch pricing plans'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  return (
    <PricingContext.Provider value={{ plans, isLoading, error }}>
      {children}
    </PricingContext.Provider>
  );
};
