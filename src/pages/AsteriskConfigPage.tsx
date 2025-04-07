
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";

const AsteriskConfigPage = () => {
  return (
    <DashboardLayout>
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-4">Asterisk Server Configuration</h1>
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Asterisk Configuration functionality has been removed from this application.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AsteriskConfigPage;
