
import React, { useState, useEffect } from 'react';
import { getRecentOperations, clearDebugHistory, OperationType } from '@/utils/supabaseDebug';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, AlertTriangle, CheckCircle, DatabaseIcon } from 'lucide-react';
import { useAuth } from '@/contexts/auth';

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
  
  const getBadgeColor = (type: OperationType) => {
    switch(type) {
      case OperationType.READ: return "bg-blue-500";
      case OperationType.WRITE: return "bg-green-500";
      case OperationType.DELETE: return "bg-red-500";
      case OperationType.UPDATE: return "bg-yellow-500";
      case OperationType.AUTH: return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };
  
  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <DatabaseIcon className="h-5 w-5" />
            <CardTitle>Supabase Diagnostic</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isAuthenticated ? "default" : "destructive"}>
              {isAuthenticated ? "Authenticated" : "Not Authenticated"}
            </Badge>
            {isAuthenticated && user && (
              <Badge variant="outline">{user.id.substring(0, 8)}...</Badge>
            )}
            {errorCount > 0 && (
              <Badge variant="destructive">{errorCount} Errors</Badge>
            )}
          </div>
        </div>
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
            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredOperations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No operations recorded yet
                </div>
              ) : (
                filteredOperations.map((op, i) => (
                  <div key={i} className="border rounded-md p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getBadgeColor(op.operation)}>
                          {op.operation}
                        </Badge>
                        {op.table && (
                          <span className="text-sm font-medium">{op.table}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {op.success ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(op.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-xs font-mono mt-1 text-muted-foreground">
                      Auth: {op.auth_status || 'UNKNOWN'}
                      {op.user_id && ` | User: ${op.user_id.substring(0, 8)}...`}
                    </div>
                    
                    {op.error && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800 font-mono overflow-x-auto">
                        {typeof op.error === 'string' 
                          ? op.error 
                          : op.error.message || JSON.stringify(op.error, null, 2)
                        }
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
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
