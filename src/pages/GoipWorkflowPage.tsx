
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { WorkflowInstructions } from '@/components/goip/WorkflowInstructions';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Info } from 'lucide-react';

const GoipWorkflowPage = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-2">GoIP-Asterisk Integration Workflow</h1>
        <p className="text-muted-foreground mb-6">
          Complete guide to setting up your GoIP device with Asterisk for outbound campaigns
        </p>
        
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-700 dark:text-blue-300">For Your Assistant</h3>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                This page provides a complete workflow for integrating GoIP devices with Asterisk. You can use this as a reference when configuring new systems or troubleshooting connection issues.
              </p>
            </div>
          </div>
        </div>
        
        <WorkflowInstructions />
        
        <Card className="mt-6">
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Configuration Files Quick Reference</h3>
            <Separator className="my-4" />
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Basic sip.conf Configuration</h4>
                <pre className="text-xs bg-muted p-4 rounded-md">
{`[general]
context=public
allowguest=no
alwaysauthreject=yes
realm=asterisk
useragent=Asterisk PBX
dtmfmode=rfc2833
canreinvite=no

#include "sip_goip.conf"`}
                </pre>
              </div>
              <div>
                <h4 className="font-medium mb-2">Basic extensions.conf Configuration</h4>
                <pre className="text-xs bg-muted p-4 rounded-md">
{`[general]
static=yes
writeprotect=no
priorityjumping=no
autofallthrough=yes

[globals]
TRANSFER_CONTEXT=transfer-calls

#include "extensions_goip.conf"`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default GoipWorkflowPage;
