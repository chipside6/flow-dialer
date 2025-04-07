
import React, { useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Copy, Check, RefreshCcw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

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
}

export const CredentialTable = ({ credentials, isLoading }: CredentialTableProps) => {
  const [copyStatus, setCopyStatus] = useState<{[key: number]: boolean}>({});
  const { toast } = useToast();

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
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Port Number</TableHead>
              <TableHead>SIP Username</TableHead>
              <TableHead>SIP Password</TableHead>
              <TableHead>SIP Server</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {uniqueCredentials.map((credential) => (
              <TableRow key={credential.id}>
                <TableCell>Port {credential.port_number}</TableCell>
                <TableCell>{credential.sip_user}</TableCell>
                <TableCell>{credential.sip_pass}</TableCell>
                <TableCell>your-asterisk-ip</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(
                      credential.port_number,
                      `Server: your-asterisk-ip\nUsername: ${credential.sip_user}\nPassword: ${credential.sip_pass}`
                    )}
                  >
                    {copyStatus[credential.port_number] ? (
                      <Check className="h-4 w-4 mr-1" />
                    ) : (
                      <Copy className="h-4 w-4 mr-1" />
                    )}
                    Copy
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
