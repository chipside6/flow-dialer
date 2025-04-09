
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

export const TrialExpiredNotice = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
      <AlertTriangle className="h-16 w-16 text-yellow-500 mb-4" />
      <h2 className="text-2xl font-bold mb-2">Upgrade Required</h2>
      <p className="text-muted-foreground mb-6 max-w-lg">
        You need to upgrade to our Lifetime plan to create and manage campaigns. 
        Unlock unlimited calls and advanced features with a one-time payment.
      </p>
      <Button asChild size="lg" className="font-semibold">
        <Link to="/upgrade">Upgrade Now</Link>
      </Button>
    </div>
  );
};
