
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { PhoneCall, PhoneForwarded, PhoneOff, VoicemailIcon, Phone } from "lucide-react";

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
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className={iconColor}>{icon}</span>
            <span>{title} Details</span>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-2 p-1">
            {phoneNumbers.length > 0 ? (
              phoneNumbers.map((phone, idx) => (
                <Card key={idx} className="p-3">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground text-sm">{phone}</span>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No phone numbers available
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
