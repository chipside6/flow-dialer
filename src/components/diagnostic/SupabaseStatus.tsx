
import React, { useState, useEffect } from 'react';
import { getRecentOperations, clearDebugHistory, OperationType } from '@/utils/supabaseDebug';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { StatusHeader } from './StatusHeader';
import { OperationsList } from './OperationsList';

export function SupabaseStatus() {
  const [operations, setOperations] = useState(getRecentOperations());
  const [activeTab, setActiveTab] = useState<string>("all");
  const { isAuthenticated, user } = useAuth();
  
  // Refresh data every 2 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setOperations(getRecentOperations());
    }, 2000);
    
    return () => clearInterval(timer);
  }, []);
  
  const handleClearHistory = () => {
    clearDebugHistory();
    setOperations([]);
  };
  
  const handleRefresh = () => {
    setOperations(getRecentOperations());
  };
  
  const filteredOperations = activeTab === "all" 
    ? operations 
    : operations.filter(op => op.operation === activeTab);
  
  const errorCount = operations.filter(op => !op.success).length;
  
  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <StatusHeader 
          isAuthenticated={isAuthenticated} 
          user={user} 
          errorCount={errorCount} 
        />
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value={OperationType.READ}>Read</TabsTrigger>
            <TabsTrigger value={OperationType.WRITE}>Write</TabsTrigger>
            <TabsTrigger value={OperationType.UPDATE}>Update</TabsTrigger>
            <TabsTrigger value={OperationType.DELETE}>Delete</TabsTrigger>
            <TabsTrigger value={OperationType.AUTH}>Auth</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-0">
            <OperationsList operations={filteredOperations} />
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleClearHistory}
        >
          Clear History
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Refresh</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
