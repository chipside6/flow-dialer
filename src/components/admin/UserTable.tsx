
import React from "react";
import { User } from "@supabase/supabase-js";
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
import { CheckCircle, XCircle } from "lucide-react";

// Define the interface for profile data
interface UserProfile {
  user_id: string;
  created_at: string;
  is_admin: boolean | null;
  is_affiliate: boolean | null;
  full_name: string | null;
  company_name: string | null;
  updated_at: string;
}

interface UserTableProps {
  users: (User & { profile?: UserProfile })[];
  toggleAffiliate: (userId: string, isAffiliate: boolean) => void;
  isLoading: boolean;
}

export function UserTable({ users, toggleAffiliate, isLoading }: UserTableProps) {
  return (
    <div className="rounded-md border">
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
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center h-24">
                {isLoading ? "Loading users..." : "No users found"}
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-mono text-xs">{user.id.split('-')[0]}...</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
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
  );
}
