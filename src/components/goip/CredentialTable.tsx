
import React, { useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Copy, Check, RefreshCcw, MoreHorizontal, Trash2, ClipboardCopy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ASTERISK_CONFIG } from '@/config/productionConfig';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SipCredential {
  id: string;
  port_number: number;
  sip_user: string;
  sip_pass: string;
  trunk_name: string;
  status: string;
}

interface CredentialTableProps {
  credentials: SipCredential[];
  isLoading: boolean;
  onRegenerateCredential?: (portNumber: number) => void;
  onDeleteCredential?: (id: string) => void;
}

export const CredentialTable = ({ 
  credentials, 
  isLoading, 
  onRegenerateCredential, 
  onDeleteCredential 
}: CredentialTableProps) => {
  const [copyStatus, setCopyStatus] = useState<{[key: number]: boolean}>({});
  const { toast } = useToast();
  const asteriskIp = ASTERISK_CONFIG.apiUrl.split(':')[0]; // Extract just the IP part

  // Copy credentials to clipboard
  const copyToClipboard = (portNumber: number, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Set copy status for this specific port
      setCopyStatus(prev => ({ ...prev, [portNumber]: true }));
      
      // Reset copy status after 2 seconds
      setTimeout(() => {
        setCopyStatus(prev => ({ ...prev, [portNumber]: false }));
      }, 2000);
      
      toast({
        title: "Copied to clipboard",
        description: "SIP credentials have been copied to your clipboard."
      });
    }).catch(err => {
      console.error('Copy failed:', err);
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard. Please try again.",
        variant: "destructive"
      });
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <RefreshCcw className="h-8 w-8 mx-auto animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Loading your SIP credentials...</p>
      </div>
    );
  }

  if (credentials.length === 0) {
    return null;
  }

  // Group credentials by port number to prevent duplicates
  const uniqueCredentialsByPort = credentials.reduce<Record<number, SipCredential>>((acc, credential) => {
    acc[credential.port_number] = credential;
    return acc;
  }, {});

  const uniqueCredentials = Object.values(uniqueCredentialsByPort);

  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium mb-4">Your SIP Credentials</h3>
      <div className="credential-table-wrapper">
        <div className="credentials-list space-y-4">
          {uniqueCredentials.map((credential) => (
            <div key={credential.id} className="bg-card border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-base font-medium">Port {credential.port_number}</h4>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4 mr-2" />
                      Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Credential Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => copyToClipboard(
                      credential.port_number,
                      `Server: ${asteriskIp}\nUsername: ${credential.sip_user}\nPassword: ${credential.sip_pass}`
                    )}>
                      <ClipboardCopy className="h-4 w-4 mr-2" />
                      Copy Credentials
                    </DropdownMenuItem>
                    {onRegenerateCredential && (
                      <DropdownMenuItem onClick={() => onRegenerateCredential(credential.port_number)}>
                        <RefreshCcw className="h-4 w-4 mr-2" />
                        Regenerate
                      </DropdownMenuItem>
                    )}
                    {onDeleteCredential && (
                      <DropdownMenuItem onClick={() => onDeleteCredential(credential.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">SIP Username</label>
                  <div className="bg-muted p-2 rounded flex justify-between items-center">
                    <span className="text-sm font-mono">{credential.sip_user}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0" 
                      onClick={() => copyToClipboard(credential.port_number + 100, credential.sip_user)}
                    >
                      <ClipboardCopy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">SIP Password</label>
                  <div className="bg-muted p-2 rounded flex justify-between items-center">
                    <span className="text-sm font-mono">{credential.sip_pass}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0" 
                      onClick={() => copyToClipboard(credential.port_number + 200, credential.sip_pass)}
                    >
                      <ClipboardCopy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">SIP Server</label>
                  <div className="bg-muted p-2 rounded flex justify-between items-center">
                    <span className="text-sm font-mono">{asteriskIp}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0" 
                      onClick={() => copyToClipboard(credential.port_number + 300, asteriskIp)}
                    >
                      <ClipboardCopy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
