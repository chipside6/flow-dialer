
import React from 'react';
import { Button } from '@/components/ui/button';
import { useContactLists } from '@/hooks/useContactLists';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Loader2 } from 'lucide-react';

interface ContactListSelectorProps {
  selectedContactListId: string;
  onSelect: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const ContactListSelector: React.FC<ContactListSelectorProps> = ({
  selectedContactListId,
  onSelect,
  onNext,
  onBack
}) => {
  const { lists, isLoading } = useContactLists();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading contact lists...</span>
      </div>
    );
  }

  if (!lists || lists.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="mb-4">No contact lists found. Create a contact list first.</p>
        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Select a Contact List</h3>
      
      <div className="grid gap-3">
        {lists.map((list) => (
          <Card 
            key={list.id} 
            className={`cursor-pointer transition-colors ${
              selectedContactListId === list.id 
                ? 'border-primary bg-primary/5' 
                : 'hover:border-primary/50'
            }`}
            onClick={() => onSelect(list.id)}
          >
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <h4 className="font-medium">{list.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {list.count || 0} contacts
                </p>
              </div>
              {selectedContactListId === list.id && (
                <Check className="h-5 w-5 text-primary" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!selectedContactListId}
        >
          Next: Select Greeting
        </Button>
      </div>
    </div>
  );
};
