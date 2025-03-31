
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AdminUserCreator } from "./AdminUserCreator";

interface AdminHeaderProps {
  userCount: number;
}

export function AdminHeader({ userCount }: AdminHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Total Users</p>
            </div>
            <div className="flex items-center">
              <div className="text-2xl font-bold">{userCount}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-center">
            <AdminUserCreator />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
