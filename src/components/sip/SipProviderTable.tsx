
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
    <Card className="w-full overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Server className="mr-2 h-5 w-5" />
          Your SIP Providers
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        {providers.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No SIP providers configured yet. Add your first provider.
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Host</TableHead>
                  <TableHead className="hidden md:table-cell">Username</TableHead>
                  <TableHead className="hidden md:table-cell">Added</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell className="font-medium">{provider.name}</TableCell>
                    <TableCell>
                      {provider.host}
                      <span className="hidden md:inline">:{provider.port}</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{provider.username}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        {formatDistanceToNow(provider.dateAdded, { addSuffix: true })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {provider.isActive ? (
                          <span className="flex items-center text-green-600">
                            <Check className="mr-1 h-4 w-4" /> 
                            <span className="hidden md:inline">Active</span>
                          </span>
                        ) : (
                          <span className="flex items-center text-red-600">
                            <X className="mr-1 h-4 w-4" /> 
                            <span className="hidden md:inline">Inactive</span>
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onToggleStatus(provider.id)}
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
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onDelete(provider.id)}
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
