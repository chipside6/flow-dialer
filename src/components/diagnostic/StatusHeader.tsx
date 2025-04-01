
import React from 'react';

interface StatusHeaderProps {
  title: string;
  status: 'online' | 'error' | 'warning' | 'offline';
}

export function StatusHeader({ title, status }: StatusHeaderProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      case 'offline':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  const getStatusText = () => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'warning':
        return 'Warning';
      case 'error':
        return 'Error';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };
  
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="flex items-center space-x-2">
        <div className={`h-3 w-3 rounded-full ${getStatusColor()}`} />
        <span className="text-sm font-medium">{getStatusText()}</span>
      </div>
    </div>
  );
}
