
import React from "react";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { AdminPanelUser, UserProfile } from "./UserManagement";

interface UserTableProps {
  users: AdminPanelUser[];
  toggleAffiliate: (userId: string, isAffiliate: boolean) => void;
  isLoading: boolean;
}

export function UserTable({ users, toggleAffiliate, isLoading }: UserTableProps) {
  console.log("UserTable - Rendering with users:", users?.length || 0);
  
  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading users...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono text-xs">
                    {user.id ? user.id.substring(0, 8) + '...' : 'N/A'}
                  </TableCell>
                  <TableCell>{user.email || 'No Email'}</TableCell>
                  <TableCell>
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {user.profile?.is_admin && (
                      <Badge variant="secondary" className="mr-1">Admin</Badge>
                    )}
                    {user.profile?.is_affiliate ? (
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Affiliate
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        <XCircle className="h-3 w-3 mr-1" />
                        Standard
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant={user.profile?.is_affiliate ? "destructive" : "default"}
                      size="sm"
                      onClick={() => toggleAffiliate(user.id, !!user.profile?.is_affiliate)}
                      disabled={isLoading}
                    >
                      {user.profile?.is_affiliate ? "Remove Affiliate" : "Make Affiliate"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
