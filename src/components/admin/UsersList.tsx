
import React from "react";
import { 
  Table, TableHeader, TableBody, 
  TableHead, TableRow, TableCell 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface AdminUser {
  id: string;
  email?: string | null;
  created_at?: string;
  profile?: {
    id: string;
    full_name?: string | null;
    is_admin?: boolean | null;
    created_at?: string;
    updated_at?: string;
    user_id: string;
  };
}

interface UsersListProps {
  users: AdminUser[];
  isLoading: boolean;
}

export function UsersList({ users, isLoading }: UsersListProps) {
  console.log("UsersList - Rendering with users:", users?.length || 0, "isLoading:", isLoading);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40 border rounded-md">
        <div className="flex flex-col items-center space-y-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <Alert variant="default" className="bg-muted">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No users found in the database. Users will appear here once they sign up.
        </AlertDescription>
      </Alert>
    );
  }
  
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
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
                  <Badge variant="outline" className="text-muted-foreground">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Standard
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
