
import React from "react";
import { CheckCircle } from "lucide-react";

export const ConfigurationFeatures: React.FC = () => {
  const features = [
    "Automatically fetch user campaigns from your Supabase API",
    "Use each user's own SIP provider for outgoing calls",
    "Handle dynamic routing for all users' campaigns",
    "Support SIP trunks for all configured providers",
    "Manage call transfers and IVR menus",
    "Act as a central station for greeting audio and transfers only",
    "Clean up temporary files and maintain system health"
  ];

  return (
    <>
      <p className="text-muted-foreground mb-3">
        This master configuration creates a complete Asterisk setup that will:
      </p>
      
      <ul className="space-y-2 text-sm">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-primary" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </>
  );
};
