
import React from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/subscription";

interface LimitReachedDialogProps {
  open: boolean;
  onClose: () => void;
}

export function LimitReachedDialog({ open, onClose }: LimitReachedDialogProps) {
  const navigate = useNavigate();
  const { callLimit } = useSubscription();

  const handleUpgradeClick = () => {
    onClose(); // Close the dialog
    navigate('/billing'); // Navigate to billing page
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
          </div>
          <DialogTitle className="text-center text-xl pt-4">Monthly Call Limit Reached</DialogTitle>
          <DialogDescription className="text-center">
            You've reached your {callLimit} calls limit for this month on the free plan. 
            Upgrade to lifetime access for unlimited calls.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="rounded-lg bg-muted p-4">
            <h4 className="font-medium mb-2">Lifetime Plan Benefits:</h4>
            <ul className="text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary text-lg">•</span>
                <span>Unlimited calls forever</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary text-lg">•</span>
                <span>Advanced features unlocked</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary text-lg">•</span>
                <span>One-time payment, no subscriptions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary text-lg">•</span>
                <span>Pay just $199 for lifetime access</span>
              </li>
            </ul>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="sm:w-auto w-full">
            Stay on Free Plan
          </Button>
          <Button 
            onClick={handleUpgradeClick} 
            className="sm:w-auto w-full"
          >
            Upgrade to Lifetime
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
