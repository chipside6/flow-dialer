
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface DiagnosticCardProps {
  title: string;
  icon: LucideIcon;
  onClick: () => Promise<void>;
  isLoading: boolean;
  loadingText: string;
  actionText: string;
}

export const DiagnosticCard: React.FC<DiagnosticCardProps> = ({
  title,
  icon: Icon,
  onClick,
  isLoading,
  loadingText,
  actionText
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <Button 
          onClick={onClick} 
          className="w-full"
          variant="outline"
          disabled={isLoading}
        >
          {isLoading ? loadingText : actionText}
        </Button>
      </CardContent>
    </Card>
  );
};
