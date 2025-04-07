
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Server, Trash, Calendar, Check, X, Edit } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { SipProvider } from "@/types/sipProviders";

interface SipProviderTableProps {
  providers: SipProvider[];
  onEdit: (provider: SipProvider) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export const SipProviderTable: React.FC<SipProviderTableProps> = ({
  providers,
  onEdit,
  onDelete,
  onToggleStatus
}) => {
  return (
    <Card className="w-full max-w-full overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Server className="mr-2 h-5 w-5" />
          Your SIP Providers
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {providers.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No SIP providers configured yet. Add your first provider.
          </div>
        ) : (
          <div className="w-full table-container overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap pl-6 py-4">Name</TableHead>
                  <TableHead className="whitespace-nowrap px-4 py-4">Host</TableHead>
                  <TableHead className="whitespace-nowrap px-4 py-4">Username</TableHead>
                  <TableHead className="whitespace-nowrap px-4 py-4">Added</TableHead>
                  <TableHead className="whitespace-nowrap px-4 py-4">Status</TableHead>
                  <TableHead className="whitespace-nowrap px-4 py-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell className="font-medium whitespace-nowrap pl-6 py-4">{provider.name}</TableCell>
                    <TableCell className="whitespace-nowrap px-4 py-4">
                      {provider.host}:{provider.port}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-4 py-4">{provider.username}</TableCell>
                    <TableCell className="whitespace-nowrap px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span>{formatDistanceToNow(provider.dateAdded, { addSuffix: true })}</span>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-4 py-4">
                      <div className="flex items-center">
                        {provider.isActive ? (
                          <span className="flex items-center text-green-600 gap-1.5">
                            <Check className="h-4 w-4 flex-shrink-0" /> Active
                          </span>
                        ) : (
                          <span className="flex items-center text-red-600 gap-1.5">
                            <X className="h-4 w-4 flex-shrink-0" /> Inactive
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onToggleStatus(provider.id)}
                          className="h-8 w-8 p-0"
                          title={provider.isActive ? "Deactivate" : "Activate"}
                        >
                          {provider.isActive ? (
                            <X className="h-4 w-4 text-red-600" />
                          ) : (
                            <Check className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onEdit(provider)}
                          className="h-8 w-8 p-0"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onDelete(provider.id)}
                          className="h-8 w-8 p-0"
                          title="Delete"
                        >
                          <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
