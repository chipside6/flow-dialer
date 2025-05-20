
import React from 'react';
import { PortStatusBadge } from '../PortStatusBadge';

interface PortDisplayProps {
  port: any;
}

export const PortDisplay: React.FC<PortDisplayProps> = ({ port }) => {
  return (
    <div 
      key={port.id} 
      className="border rounded p-2 flex flex-col text-sm"
    >
      <div className="flex items-center justify-between">
        <span className="font-medium">Port {port.port_number}</span>
        <PortStatusBadge status={port.status === "active" ? "idle" : "error"} />
      </div>
      <div className="text-xs text-muted-foreground mt-1">
        SIP: {port.sip_user || "Unknown"}
      </div>
    </div>
  );
};
