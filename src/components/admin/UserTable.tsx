
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, MoreHorizontal, UserPlus, CreditCard, Clock } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { AdminPanelUser } from "./UserManagement";
import { useLifetimePlan } from "@/hooks/subscription";

interface UserTableProps {
  users: AdminPanelUser[];
  isLoading: boolean;
}

export function UserTable({ users = [], isLoading }: UserTableProps) {
  const [selectedUser, setSelectedUser] = useState<AdminPanelUser | null>(null);
  const [isActivatingLifetime, setIsActivatingLifetime] = useState(false);
  const [isActivatingTrial, setIsActivatingTrial] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [planType, setPlanType] = useState<'lifetime' | 'trial' | null>(null);
  const { activateLifetimePlan, activateTrialPlan } = useLifetimePlan(
    selectedUser?.id,
    async () => { 
      toast({
        title: "Plan updated",
        description: "The user's subscription has been updated."
      });
      setSelectedUser(null);
    }
  );

  const handleActivatePlan = async () => {
    if (!selectedUser) return;
    
    if (planType === 'lifetime') {
      setIsActivatingLifetime(true);
      try {
        const result = await activateLifetimePlan();
        if (result.success) {
          toast({
            title: "Lifetime Plan Activated",
            description: `Lifetime plan activated for ${selectedUser.email || selectedUser.id}`
          });
        } else {
          toast({
            title: "Error Activating Plan",
            description: result.error?.message || "An unknown error occurred",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error activating lifetime plan:", error);
        toast({
          title: "Error Activating Plan",
          description: "Failed to activate lifetime plan",
          variant: "destructive"
        });
      } finally {
        setIsActivatingLifetime(false);
        setConfirmDialogOpen(false);
      }
    } else if (planType === 'trial') {
      setIsActivatingTrial(true);
      try {
        const result = await activateTrialPlan();
        if (result.success) {
          toast({
            title: "Trial Plan Activated",
            description: `3-day trial activated for ${selectedUser.email || selectedUser.id}`
          });
        } else {
          toast({
            title: "Error Activating Trial",
            description: result.error?.message || "An unknown error occurred",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error activating trial plan:", error);
        toast({
          title: "Error Activating Trial",
          description: "Failed to activate trial plan",
          variant: "destructive"
        });
      } finally {
        setIsActivatingTrial(false);
        setConfirmDialogOpen(false);
      }
    }
  };

  const openConfirmDialog = (user: AdminPanelUser, type: 'lifetime' | 'trial') => {
    setSelectedUser(user);
    setPlanType(type);
    setConfirmDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableCaption>
          {users.length === 0 ? "No users found" : `Showing ${users.length} users`}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email || "N/A"}</TableCell>
                <TableCell>{user.profile?.full_name || "N/A"}</TableCell>
                <TableCell>
                  {user.profile?.is_admin ? (
                    <Badge className="bg-primary">Admin</Badge>
                  ) : (
                    <Badge variant="outline">User</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {user.created_at 
                    ? new Date(user.created_at).toLocaleDateString() 
                    : "N/A"}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem 
                        onClick={() => openConfirmDialog(user, 'lifetime')}
                        className="flex items-center gap-2"
                      >
                        <CreditCard className="h-4 w-4" />
                        <span>Activate Lifetime Plan</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => openConfirmDialog(user, 'trial')}
                        className="flex items-center gap-2"
                      >
                        <Clock className="h-4 w-4" />
                        <span>Activate 3-Day Trial</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {planType === 'lifetime' ? 'Activate Lifetime Plan' : 'Activate 3-Day Trial'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {planType === 'lifetime' 
                ? 'This will activate a lifetime plan for the selected user, giving them permanent access to all features.'
                : 'This will activate a 3-day trial for the selected user, giving them temporary access to all features.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleActivatePlan}
              disabled={isActivatingLifetime || isActivatingTrial}
            >
              {(isActivatingLifetime || isActivatingTrial) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
