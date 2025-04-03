
import React from "react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Server, Cpu } from "lucide-react";

export const ConfigurationHeader: React.FC = () => {
  return (
    <CardHeader className="pb-3 border-b border-border/40">
      <div className="flex items-center mb-1.5">
        <Server className="h-5 w-5 mr-2 text-primary" />
        <CardTitle>Asterisk Master Configuration Generator</CardTitle>
      </div>
      <CardDescription className="flex items-center text-sm">
        <Cpu className="h-3.5 w-3.5 mr-1.5 text-muted-foreground/70" />
        <span>
          Generates a universal Asterisk configuration to be installed once on your server
          to automatically handle all users and campaigns
        </span>
      </CardDescription>
    </CardHeader>
  );
};
