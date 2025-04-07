
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';

const GoipSetup = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">GoIP Setup</h1>
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              GoIP Setup functionality has been removed from this application.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default GoipSetup;
