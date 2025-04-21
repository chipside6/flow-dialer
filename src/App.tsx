
import { useEffect } from 'react';
import { Routes } from '@/routes';
import { Toaster } from '@/components/ui/toaster';
import ProductionErrorBoundary from '@/utils/productionErrorBoundary';
import { productionSafetyChecks } from '@/utils/productionSafetyChecks';
import { useToast } from '@/components/ui/use-toast';

function App() {
  const { toast } = useToast();

  // Run production safety checks
  useEffect(() => {
    const runChecks = async () => {
      try {
        const { isReady, checks } = await productionSafetyChecks.runAllChecks();
        
        if (!isReady) {
          const configCheck = checks[0] as { isValid: boolean; missingConfigs: string[] };
          if (!configCheck.isValid) {
            toast({
              title: "Configuration Error",
              description: `Missing required configurations: ${configCheck.missingConfigs.join(', ')}`,
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error("Error running production safety checks:", error);
        toast({
          title: "System Configuration Error",
          description: "Could not verify system configuration. Please contact support.",
          variant: "destructive",
        });
      }
    };

    runChecks();
  }, [toast]);

  return (
    <ProductionErrorBoundary>
      <Routes />
      <Toaster />
    </ProductionErrorBoundary>
  );
}

export default App;
