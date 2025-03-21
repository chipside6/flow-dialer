
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  onNavigateBack: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ onNavigateBack }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onNavigateBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Upgrade Your Plan</h1>
        </div>
        <p className="text-muted-foreground ml-9">Get lifetime access to all features</p>
      </div>
    </div>
  );
};
