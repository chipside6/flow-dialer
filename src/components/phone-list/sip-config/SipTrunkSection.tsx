
import React from "react";
import { Phone, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";

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
  isActionInProgress: boolean;
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
  isActionInProgress,
}) => {
  return (
    <div className="border rounded-md">
      <Button
        variant="ghost"
        className="w-full flex justify-between p-4 h-auto"
        onClick={() => setShowSipConfig(!showSipConfig)}
        disabled={isActionInProgress}
      >
        <div className="flex items-center">
          <Phone className="h-4 w-4 mr-2" />
          <span className="font-medium">SIP Trunk Configuration</span>
        </div>
        {isActionInProgress ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : showSipConfig ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>
      
      {showSipConfig && (
        <div className="p-4 pt-0 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormItem>
              <FormLabel>Provider Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., twilio, vonage"
                  value={sipTrunkProvider}
                  onChange={(e) => setSipTrunkProvider(e.target.value)}
                  disabled={isActionInProgress}
                />
              </FormControl>
            </FormItem>
            
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input
                  placeholder="SIP username"
                  value={sipUsername}
                  onChange={(e) => setSipUsername(e.target.value)}
                  disabled={isActionInProgress}
                />
              </FormControl>
            </FormItem>
            
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="SIP password"
                  value={sipPassword}
                  onChange={(e) => setSipPassword(e.target.value)}
                  disabled={isActionInProgress}
                />
              </FormControl>
            </FormItem>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <FormItem>
                  <FormLabel>Host</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., sip.provider.com"
                      value={sipHost}
                      onChange={(e) => setSipHost(e.target.value)}
                      disabled={isActionInProgress}
                    />
                  </FormControl>
                </FormItem>
              </div>
              
              <div>
                <FormItem>
                  <FormLabel>Port</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="5060"
                      value={sipPort}
                      onChange={(e) => setSipPort(e.target.value)}
                      disabled={isActionInProgress}
                    />
                  </FormControl>
                </FormItem>
              </div>
            </div>
          </div>
          
          <FormDescription>
            These settings will be used when exporting for Asterisk
          </FormDescription>
        </div>
      )}
    </div>
  );
};
