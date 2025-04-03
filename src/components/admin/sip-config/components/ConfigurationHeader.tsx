
import React from "react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Server } from "lucide-react";

export const ConfigurationHeader: React.FC = () => {
  return (
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center">
        <Server className="h-5 w-5 mr-2" />
        Asterisk Master Configuration Generator
      </CardTitle>
      <CardDescription>
        Generates a universal Asterisk configuration that can be installed once on your server
        to automatically handle all users and campaigns
      </CardDescription>
    </CardHeader>
  );
};
