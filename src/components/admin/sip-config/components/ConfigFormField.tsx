
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ConfigFormFieldProps {
  id: string;
  label: string;
  tooltip: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
}

export const ConfigFormField: React.FC<ConfigFormFieldProps> = ({
  id,
  label,
  tooltip,
  value,
  onChange,
  placeholder,
  type = "text"
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-1">
        <Label htmlFor={id}>{label}</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="focus:ring-2 focus:ring-primary focus:border-primary"
      />
    </div>
  );
};
