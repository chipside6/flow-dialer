
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

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

  // Load available ports from user's GoIP configuration
  useEffect(() => {
    if (user?.id) {
      loadAvailablePorts();
    }
  }, [user?.id]);

  const loadAvailablePorts = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    
    try {
      // Get the user's GoIP trunks
      const { data, error } = await supabase
        .from('user_trunks')
        .select('port_number, trunk_name')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('port_number');
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        const ports = data.map(trunk => ({
          port: trunk.port_number,
          label: `Port ${trunk.port_number} (${trunk.trunk_name})`
        }));
        
        setAvailablePorts(ports);
        
        // If no port is selected yet and we have ports, select the first one
        if (selectedPort === 0 && ports.length > 0) {
          onPortChange(ports[0].port);
        }
      } else {
        setAvailablePorts([]);
      }
    } catch (err) {
      console.error('Error loading available ports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePortChange = (value: string) => {
    onPortChange(parseInt(value, 10));
  };

  // If no ports available and not loading, show message and return null
  if (!isLoading && availablePorts.length === 0) {
    return (
      <div className="space-y-2">
        <Label>GoIP Port</Label>
        <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded border border-amber-200">
          <p className="font-medium">No GoIP ports configured</p>
          <p className="mt-1">Please configure your GoIP device in the Device Setup page before running campaigns.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="port">GoIP Port</Label>
      <Select
        value={selectedPort.toString()}
        onValueChange={handlePortChange}
        disabled={disabled || isLoading || availablePorts.length === 0}
      >
        <SelectTrigger id="port">
          <SelectValue placeholder="Select a port" />
        </SelectTrigger>
        <SelectContent>
          {availablePorts.map((port) => (
            <SelectItem key={port.port} value={port.port.toString()}>
              {port.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {availablePorts.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Select which GoIP port to use for this campaign
        </p>
      )}
    </div>
  );
};
