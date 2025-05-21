
import React from 'react';
import { Phone } from 'lucide-react';

interface PortDisplayProps {
  port: {
    id: string;
    port_number: number;
    status: string;
  };
}

export const PortDisplay: React.FC<PortDisplayProps> = ({ port }) => {
  const isActive = port.status === "active" || port.status === "available";
  
  return (
    <div
      className={`py-2 px-3 rounded-md text-xs flex items-center justify-between ${
        isActive
          ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
          : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
      }`}
    >
      <div className="flex items-center">
        <Phone className="h-3 w-3 mr-1.5" />
        <span>{port.port_number}</span>
      </div>
      <span className="text-xs font-medium">
        {isActive ? "Available" : "Busy"}
      </span>
    </div>
  );
};
