
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminHeaderProps {
  userCount: number;
  affiliateCount: number;
}

export function AdminHeader({ userCount, affiliateCount }: AdminHeaderProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{userCount}</div>
          <p className="text-xs text-muted-foreground">
            Registered accounts in the system
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Affiliate Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{affiliateCount}</div>
          <p className="text-xs text-muted-foreground">
            Users with affiliate status
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
