
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { GoipStatusBadge } from '@/components/goip/GoipStatusBadge';

interface PortSelectorProps {
  selectedPort: number;
  onPortChange: (port: number) => void;
  campaignId: string;
  disabled?: boolean;
}

export const PortSelector = ({ 
  selectedPort, 
  onPortChange, 
  campaignId,
  disabled = false 
}: PortSelectorProps) => {
  const { user } = useAuth();
  const [availablePorts, setAvailablePorts] = useState<{port: number, label: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load available ports from user's trunks
  useEffect(() => {
    const loadPorts = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      
      try {
        // Get user's trunks
        const { data: trunks, error } = await supabase
          .from('user_trunks')
          .select('*')
          .eq('user_id', user.id);
        
        if (error) {
          throw error;
        }
        
        // If user has trunks, use them to populate available ports
        if (trunks && trunks.length > 0) {
          const ports = trunks.map(trunk => ({
            port: trunk.port_number || 1,
            label: `Port ${trunk.port_number || 1} (${trunk.sip_user})`
          }));
          
          setAvailablePorts(ports);
          
          // If no port is selected, select the first one
          if (!selectedPort && ports.length > 0) {
            onPortChange(ports[0].port);
          }
        } else {
          // Default to 4 ports if no trunks are configured
          const defaultPorts = [1, 2, 3, 4].map(port => ({
            port,
            label: `Port ${port}`
          }));
          
          setAvailablePorts(defaultPorts);
          
          // If no port is selected, select the first one
          if (!selectedPort) {
            onPortChange(1);
          }
        }
      } catch (error) {
        console.error('Error loading ports:', error);
        
        // Fallback to default ports
        const defaultPorts = [1, 2, 3, 4].map(port => ({
          port,
          label: `Port ${port}`
        }));
        
        setAvailablePorts(defaultPorts);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPorts();
  }, [user?.id, campaignId]);
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="port">GoIP Port</Label>
        {user?.id && selectedPort && (
          <GoipStatusBadge 
            userId={user.id} 
            portNumber={selectedPort} 
            refreshInterval={30000}
          />
        )}
      </div>
      
      <Select 
        value={selectedPort?.toString()} 
        onValueChange={(value) => onPortChange(parseInt(value))}
        disabled={disabled || isLoading}
      >
        <SelectTrigger id="port" className="w-full">
          <SelectValue placeholder="Select GoIP port" />
        </SelectTrigger>
        <SelectContent>
          {availablePorts.map(({ port, label }) => (
            <SelectItem key={port} value={port.toString()}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Select which GoIP port to use for this campaign
      </p>
    </div>
  );
};
