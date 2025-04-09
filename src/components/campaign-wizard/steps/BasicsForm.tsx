
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface BasicsFormProps {
  campaign: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (field: string, value: any) => void;
  onNext: () => void;
}

export const BasicsForm: React.FC<BasicsFormProps> = ({
  campaign,
  handleInputChange,
  handleSelectChange,
  onNext
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Campaign Name</Label>
        <Input
          id="name"
          name="name"
          value={campaign.name || ''}
          onChange={handleInputChange}
          placeholder="Enter campaign name"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Input
          id="description"
          name="description"
          value={campaign.description || ''}
          onChange={handleInputChange}
          placeholder="Brief description of this campaign"
        />
      </div>

      <div className="flex justify-end mt-6">
        <Button type="button" onClick={onNext}>
          Next: Select Contacts
        </Button>
      </div>
    </div>
  );
};
