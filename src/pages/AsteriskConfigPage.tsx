import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Server, ExternalLink, AlertCircle, Copy, Download, CheckCircle, FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { AsteriskGuide } from '@/components/goip/AsteriskGuide';
import { useAuth } from "@/contexts/auth/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ScrollArea } from "@/components/ui/scroll-area";
import { masterConfigGenerator } from '@/utils/asterisk/generators/masterConfigGenerator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InstructionsContent } from "@/components/admin/sip-config/components/InstructionsContent";

const AsteriskConfigPageContent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("config");
  const masterConfig = masterConfigGenerator.generateMasterConfig("admin", "master");
  
  // Redirect regular users to GoIP setup page after a short delay
  useEffect(() => {
    if (!isAdmin) {
      const timer = setTimeout(() => {
        navigate('/goip-setup');
        toast({
          title: "Redirected",
          description: "This page is only accessible to administrators."
        });
      }, 3000); // 3 second delay before auto-redirect
      
      return () => clearTimeout(timer);
    }
  }, [navigate, isAdmin, toast]);

  const handleRedirectNow = () => {
    navigate('/goip-setup');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(masterConfig);
    setCopied(true);
    
    toast({
      title: "Copied to clipboard",
      description: "Master configuration has been copied to your clipboard"
    });
    
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleDownload = () => {
    const blob = new Blob([masterConfig], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'asterisk-autodialer-master.conf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded configuration",
      description: "asterisk-autodialer-master.conf has been downloaded"
    });
  };

  // If not admin, show a message and redirect
  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="container py-6">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Admin Access Required</AlertTitle>
            <AlertDescription>
              This page is only accessible to administrators. You are being redirected to the GoIP setup page.
            </AlertDescription>
          </Alert>
          
          <Button onClick={handleRedirectNow}>Go to GoIP Setup Now</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Asterisk Configuration</h1>
            <p className="text-muted-foreground">
              Configure and manage the Asterisk server for GoIP devices
            </p>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="config">Master Configuration</TabsTrigger>
            <TabsTrigger value="instructions">Installation Instructions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="config" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Master Asterisk Configuration
                </CardTitle>
                <CardDescription>
                  Copy this configuration to your Asterisk server at <code>/etc/asterisk/campaign-master.conf</code>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    This is the complete master configuration for your Asterisk server. After copying this file, you'll 
                    need to include it in your <code>extensions.conf</code> with the line: <code>#include "campaign-master.conf"</code>
                  </p>
                </div>
                <div className="relative">
                  <ScrollArea className="h-[500px] w-full rounded-md border p-4 bg-muted font-mono">
                    <pre className="text-xs whitespace-pre-wrap">{masterConfig}</pre>
                  </ScrollArea>
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button 
                      size="icon" 
                      variant="outline" 
                      className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                      onClick={handleCopy}
                    >
                      {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    <Button 
                      size="icon" 
                      variant="outline" 
                      className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                      onClick={handleDownload}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  <h3 className="text-sm font-medium mb-2 text-blue-700 dark:text-blue-300">
                    Quick Installation
                  </h3>
                  <ol className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-decimal pl-4">
                    <li>Copy this configuration to <code>/etc/asterisk/campaign-master.conf</code> on your Asterisk server</li>
                    <li>Include it in your main configuration with <code>#include "campaign-master.conf"</code> in <code>/etc/asterisk/extensions.conf</code></li>
                    <li>Reload Asterisk with <code>asterisk -rx "dialplan reload"</code></li>
                  </ol>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Master Config
                </Button>
                <Button
                  variant="default"
                  onClick={handleCopy}
                >
                  {copied ? <CheckCircle className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copied ? "Copied!" : "Copy to Clipboard"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="instructions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Installation Guide
                </CardTitle>
                <CardDescription>
                  Step-by-step instructions for setting up your Asterisk server
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InstructionsContent />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Asterisk Technical Guide - Admin Only */}
        <AsteriskGuide />
      </div>
    </DashboardLayout>
  );
};

const AsteriskConfigPage = () => {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AsteriskConfigPageContent />
    </ProtectedRoute>
  );
};

export default AsteriskConfigPage;
