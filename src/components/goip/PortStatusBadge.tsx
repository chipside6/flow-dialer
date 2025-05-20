
import React from 'react';
import { Badge } from '@/components/ui/badge';

type PortStatusType = 'idle' | 'busy' | 'error' | 'unreachable';

interface PortStatusBadgeProps {
  status: PortStatusType;
}

export const PortStatusBadge: React.FC<PortStatusBadgeProps> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'idle':
        return {
          variant: 'outline',
          className: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
          label: 'Available'
        };
      case 'busy':
        return {
          variant: 'outline',
          className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
          label: 'In Use'
        };
      case 'error':
        return {
          variant: 'outline',
          className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
          label: 'Error'
        };
      case 'unreachable':
        return {
          variant: 'outline',
          className: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/40 dark:text-gray-400 dark:border-gray-700',
          label: 'Unreachable'
        };
      default:
        return {
          variant: 'outline',
          className: 'bg-gray-100 text-gray-600 border-gray-200',
          label: status
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge variant="outline" className={`text-xs px-2 py-0.5 ${config.className}`}>
      {config.label}
    </Badge>
  );
};
