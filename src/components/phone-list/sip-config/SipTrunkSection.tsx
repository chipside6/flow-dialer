
import React from "react";
import { Server } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormItem, FormLabel, FormControl } from "@/components/ui/form";

interface SipTrunkSectionProps {
  showSipConfig: boolean;
  setShowSipConfig: (value: boolean) => void;
  sipTrunkProvider: string;
  setSipTrunkProvider: (value: string) => void;
  sipUsername: string;
  setSipUsername: (value: string) => void;
  sipPassword: string;
  setSipPassword: (value: string) => void;
  sipHost: string;
  setSipHost: (value: string) => void;
  sipPort: string;
  setSipPort: (value: string) => void;
}

export const SipTrunkSection: React.FC<SipTrunkSectionProps> = ({
  showSipConfig,
  setShowSipConfig,
  sipTrunkProvider,
  setSipTrunkProvider,
  sipUsername,
  setSipUsername,
  sipPassword,
  setSipPassword,
  sipHost,
  setSipHost,
  sipPort,
  setSipPort,
}) => {
  return (
    <div className="border rounded-md p-4 space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-medium flex items-center">
          <Server className="h-4 w-4 mr-2" />
          SIP Trunk Configuration
        </h3>
        <Button 
          variant="ghost" 
          onClick={() => setShowSipConfig(!showSipConfig)}
          size="sm"
        >
          {showSipConfig ? "Hide" : "Show"}
        </Button>
      </div>
      
      {showSipConfig && (
        <div className="space-y-4">
          <FormItem>
            <FormLabel>SIP Trunk Provider</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter provider name (e.g., twilio, voip.ms)"
                value={sipTrunkProvider}
                onChange={(e) => setSipTrunkProvider(e.target.value)}
              />
            </FormControl>
          </FormItem>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormItem>
              <FormLabel>SIP Username</FormLabel>
              <FormControl>
                <Input
                  placeholder="Username/Account ID"
                  value={sipUsername}
                  onChange={(e) => setSipUsername(e.target.value)}
                />
              </FormControl>
            </FormItem>
            
            <FormItem>
              <FormLabel>SIP Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Password/API Key"
                  value={sipPassword}
                  onChange={(e) => setSipPassword(e.target.value)}
                />
              </FormControl>
            </FormItem>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormItem>
              <FormLabel>SIP Host</FormLabel>
              <FormControl>
                <Input
                  placeholder="Host/Server (e.g., sip.provider.com)"
                  value={sipHost}
                  onChange={(e) => setSipHost(e.target.value)}
                />
              </FormControl>
            </FormItem>
            
            <FormItem>
              <FormLabel>SIP Port</FormLabel>
              <FormControl>
                <Input
                  placeholder="Port (default: 5060)"
                  value={sipPort}
                  onChange={(e) => setSipPort(e.target.value)}
                />
              </FormControl>
            </FormItem>
          </div>
        </div>
      )}
    </div>
  );
};
