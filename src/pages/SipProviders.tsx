
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";

const SipProviders = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">SIP Providers</h1>
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              SIP Provider functionality has been removed from this application.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SipProviders;
