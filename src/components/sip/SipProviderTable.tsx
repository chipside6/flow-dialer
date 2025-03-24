
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
  onToggleStatus,
}) => {
  return (
    <Card className="w-full max-w-full overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Server className="mr-2 h-5 w-5" />
          Your SIP Providers
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {providers.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No SIP providers configured yet. Add your first provider.
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Host</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell className="font-medium whitespace-nowrap">
                      {provider.name}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {provider.host}:{provider.port}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{provider.username}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        {provider.dateAdded
                          ? formatDistanceToNow(new Date(provider.dateAdded), { addSuffix: true })
                          : "Unknown"}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center">
                        {provider.isActive ? (
                          <span className="flex items-center text-green-600">
                            <Check className="mr-1 h-4 w-4" /> Active
                          </span>
                        ) : (
                          <span className="flex items-center text-red-600">
                            <X className="mr-1 h-4 w-4" /> Inactive
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onToggleStatus(provider.id)}
                          aria-label={`Toggle status for ${provider.name}`}
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
                          aria-label={`Edit ${provider.name}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${provider.name}?`)) {
                              onDelete(provider.id);
                            }
                          }}
                          aria-label={`Delete ${provider.name}`}
                        >
                          <Trash className="h-4 w-4 text-red-600" />
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
