
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getConfigFromStorage } from '@/utils/asterisk/config';
import { logger } from '@/utils/logger';

interface PortStatusBadgeProps {
  status: string;
  lastSeen?: string | null;
}

/**
 * Component to display the status of a port with appropriate styling
 */
export const PortStatusBadge: React.FC<PortStatusBadgeProps> = ({ status, lastSeen }) => {
  // Default configuration if needed for asterisk server
  const config = getConfigFromStorage ? getConfigFromStorage() : { serverIp: '192.168.0.197' };

  // Format last seen time if available
  const formatLastSeen = () => {
    if (!lastSeen) return 'Never';
    
    try {
      const date = new Date(lastSeen);
      return date.toLocaleString();
    } catch (error) {
      logger.error('Error formatting last seen date:', error);
      return lastSeen;
    }
  };

  // Determine badge color based on status
  const getBadgeVariant = () => {
    const normalizedStatus = status.toLowerCase();
    
    if (normalizedStatus === 'online' || normalizedStatus === 'registered') {
      return 'success';
    } else if (normalizedStatus === 'offline' || normalizedStatus === 'unregistered') {
      return 'destructive';
    } else if (normalizedStatus === 'inactive') {
      return 'warning';
    } else {
      return 'default';
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <Badge 
        variant={getBadgeVariant() as any}
        className="status-badge font-medium"
      >
        {status}
      </Badge>
      {lastSeen && (
        <span className="text-xs text-muted-foreground">
          Last seen: {formatLastSeen()}
        </span>
      )}
    </div>
  );
};

export default PortStatusBadge;
