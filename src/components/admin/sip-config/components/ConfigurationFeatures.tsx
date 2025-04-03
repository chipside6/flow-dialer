
import React from "react";

export const ConfigurationFeatures: React.FC = () => {
  return (
    <>
      <p className="text-muted-foreground">
        This master configuration creates a complete Asterisk setup that will:
      </p>
      
      <ul className="list-disc pl-5 space-y-1 text-sm">
        <li>Automatically fetch user campaigns from your Supabase API</li>
        <li>Use each user's own SIP provider for outgoing calls</li>
        <li>Handle dynamic routing for all users' campaigns</li>
        <li>Support SIP trunks for all configured providers</li>
        <li>Manage call transfers and IVR menus</li>
        <li>Act as a central station for greeting audio and transfers only</li>
        <li>Clean up temporary files and maintain system health</li>
      </ul>
    </>
  );
};
