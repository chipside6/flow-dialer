
import React from 'react';
import { AsteriskConnectionTest } from "@/components/diagnostic/AsteriskConnectionTest";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Server } from "lucide-react";

const AsteriskConnectionTestPage: React.FC = () => {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Asterisk Connection Test</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Server className="mr-2 h-5 w-5" />
            Asterisk Server Connection
          </CardTitle>
          <CardDescription>
            Test the connection to your Asterisk server and view configuration details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AsteriskConnectionTest />
        </CardContent>
      </Card>
      
      <p className="text-sm text-muted-foreground">
        If you encounter issues connecting to your Asterisk server, check the troubleshooting section 
        that appears after running the test.
      </p>
    </div>
  );
};

export default AsteriskConnectionTestPage;
