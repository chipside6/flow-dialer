
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface CallDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  phoneNumbers: string[];
  icon: React.ReactNode;
  iconColor: string;
}

export const CallDetailsModal: React.FC<CallDetailsModalProps> = ({
  open,
  onOpenChange,
  title,
  phoneNumbers,
  icon,
  iconColor
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-center gap-2">
          <span className={iconColor}>{icon}</span>
          <DialogTitle>{title} Details</DialogTitle>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        <div className="py-4">
          <h3 className="mb-2 font-medium">Phone Numbers:</h3>
          {phoneNumbers.length > 0 ? (
            <ul className="space-y-2">
              {phoneNumbers.map((number, index) => (
                <li key={index} className="flex items-center justify-between border-b pb-2">
                  <span>{number}</span>
                  <Button variant="ghost" size="sm">
                    Call Again
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No phone numbers to display.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
