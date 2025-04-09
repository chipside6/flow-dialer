
import React from 'react';
import { Button } from '@/components/ui/button';
import { TransferNumberSelector } from '@/components/dialer/TransferNumberSelector';
import { PortSelector } from '@/components/dialer/PortSelector';

interface TransferNumberStepProps {
  transferNumber: string;
  portNumber: string;
  onTransferNumberChange: (value: string) => void;
  onPortNumberChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const TransferNumberStep: React.FC<TransferNumberStepProps> = ({
  transferNumber,
  portNumber,
  onTransferNumberChange,
  onPortNumberChange,
  onNext,
  onBack
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Transfer Settings</h3>
        
        <TransferNumberSelector 
          selectedTransferNumber={transferNumber}
          onChange={onTransferNumberChange}
        />
        
        <PortSelector 
          selectedPort={portNumber}
          onChange={onPortNumberChange}
        />
      </div>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button 
          onClick={onNext}
        >
          Next: Review Campaign
        </Button>
      </div>
    </div>
  );
};
