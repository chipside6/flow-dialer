
import React from 'react';
import { DashboardContent } from '@/components/layout/DashboardContent';
import { Button } from '@/components/ui/button';

export const DialerTab = () => {
  return (
    <DashboardContent>
      <div className="max-w-4xl mx-auto p-4 text-center">
        <h2 className="text-xl font-semibold mb-3 text-center">Quick Dialer</h2>
        <p className="text-muted-foreground text-sm mb-6 text-center">
          The quick dialer feature allows you to make calls without setting up a full campaign.
          This feature is coming soon.
        </p>
        
        {/* Placeholder for quick dialer UI */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mx-auto max-w-md">
          <p className="text-muted-foreground text-center">Quick dialer functionality will be available soon</p>
          <Button className="mt-4 mx-auto" disabled>Start Quick Call</Button>
        </div>
      </div>
    </DashboardContent>
  );
};
