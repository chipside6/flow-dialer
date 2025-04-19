
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Circle } from 'lucide-react';

type StatusType = 'idle' | 'in-call' | 'error';

interface PortStatusBadgeProps {
  status: StatusType;
}

export const PortStatusBadge = ({ status }: PortStatusBadgeProps) => {
  const getStatusConfig = (status: StatusType) => {
    switch (status) {
      case 'idle':
        return { variant: 'success' as const, label: 'Idle' };
      case 'in-call':
        return { variant: 'destructive' as const, label: 'In Call' };
      case 'error':
        return { variant: 'secondary' as const, label: 'Error' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <Circle className="h-2 w-2 fill-current" />
      {config.label}
    </Badge>
  );
};
