
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TransferNumber } from '@/types/transferNumber';
import { AddTransferNumberCard } from './AddTransferNumberCard';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface TransferNumbersListProps {
  transferNumbers: TransferNumber[];
  isSubmitting: boolean;
  isLoading?: boolean;
  error?: string | null;
  onAddTransferNumber: (name: string, number: string, description: string) => Promise<any>;
  onDeleteTransferNumber: (id: string) => Promise<boolean>;
  onRefresh?: () => void;
}

export const TransferNumbersList: React.FC<TransferNumbersListProps> = ({
  transferNumbers,
  isSubmitting,
  isLoading,
  error,
  onAddTransferNumber,
  onDeleteTransferNumber,
  onRefresh
}) => {
  const [realtimeEnabled, setRealtimeEnabled] = useState(false);
  const [activeCallCounts, setActiveCallCounts] = useState<Record<string, number>>({});
  
  // Setup realtime subscription for transfer numbers
  useEffect(() => {
    if (!realtimeEnabled) return;
    
    // Subscribe to realtime updates on transfer_numbers
    const numberChannel = supabase
      .channel('transfer-numbers-updates')
      .on(
        'postgres_changes',
        { 
          event: '*',
          schema: 'public', 
          table: 'transfer_numbers'
        },
        (payload) => {
          console.log('Transfer number update:', payload);
          
          // Refresh list on important changes
          if (onRefresh) {
            onRefresh();
          }
        }
      )
      .subscribe();
      
    // Subscribe to active calls count for transfer numbers
    const callsChannel = supabase
      .channel('transfer-number-calls')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'active_calls'
        },
        (payload) => {
          console.log('Active call update:', payload);
          
          // Get active call counts for each transfer number
          fetchActiveCallCounts();
        }
      )
      .subscribe();
      
    // Initial fetch of active call counts
    fetchActiveCallCounts();
    
    return () => {
      supabase.removeChannel(numberChannel);
      supabase.removeChannel(callsChannel);
    };
  }, [realtimeEnabled, onRefresh]);
  
  // Fetch active call counts for transfer numbers
  const fetchActiveCallCounts = async () => {
    try {
      // Query active calls without transfer_number_id for now
      // This will be updated later when we have data with transfer_number_id
      const { data, error } = await supabase
        .from('active_calls')
        .select('id')
        .is('end_time', null); // Only count active calls
        
      if (error) throw error;
      
      // For now, simulate by distributing calls among transfer numbers
      // In a real scenario, you would use the transfer_number_id field
      const counts: Record<string, number> = {};
      
      if (transferNumbers.length > 0 && data && data.length > 0) {
        // Just distribute calls evenly among transfer numbers for demonstration
        transferNumbers.forEach((tn, index) => {
          counts[tn.id] = index % 2 === 0 ? 1 : 0; // Every other number has a call
        });
      }
      
      setActiveCallCounts(counts);
    } catch (error) {
      console.error('Error fetching active call counts:', error);
    }
  };
  
  const toggleRealtime = () => {
    setRealtimeEnabled(prev => !prev);
    
    toast({
      title: realtimeEnabled ? 'Realtime updates disabled' : 'Realtime updates enabled',
      description: realtimeEnabled 
        ? 'You will need to refresh manually to see updates' 
        : 'You will now see live updates to transfer numbers and active calls',
    });
  };

  return (
    <div className="space-y-6">
      <AddTransferNumberCard
        onAddTransferNumber={onAddTransferNumber}
        isSubmitting={isSubmitting}
      />

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Transfer Numbers</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleRealtime}
            className={realtimeEnabled ? "bg-primary/10" : ""}
          >
            {realtimeEnabled ? "Realtime: ON" : "Realtime: OFF"}
          </Button>
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-2">Refresh</span>
            </Button>
          )}
        </div>
      </div>

      {transferNumbers.length > 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="divide-y">
              {transferNumbers.map((tn) => (
                <div key={tn.id} className="py-4 first:pt-0 last:pb-0 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{tn.name}</h3>
                      {activeCallCounts[tn.id] > 0 && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <Phone className="h-3 w-3 mr-1" /> {activeCallCounts[tn.id]} active
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{tn.number}</p>
                    {tn.description && (
                      <p className="text-sm text-muted-foreground mt-1">{tn.description}</p>
                    )}
                    {tn.callCount > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Total calls: {tn.callCount}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteTransferNumber(tn.id)}
                    className="text-destructive hover:text-destructive/90"
                    disabled={activeCallCounts[tn.id] > 0}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed border-muted">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground text-center">
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              ) : (
                "You haven't added any transfer numbers yet."
              )}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
