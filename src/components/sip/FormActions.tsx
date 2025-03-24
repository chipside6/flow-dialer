
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Server } from "lucide-react";

interface FormActionsProps {
  isEditing: boolean;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export const FormActions: React.FC<FormActionsProps> = ({
  isEditing,
  onCancel,
  isSubmitting = false
}) => {
  return (
    <div className="flex space-x-2">
      <Button type="submit" disabled={isSubmitting}>
        {isEditing ? (
          <>
            <Edit className="mr-2 h-4 w-4" />
            Update Provider
          </>
        ) : (
          <>
            <Server className="mr-2 h-4 w-4" />
            Add Provider
          </>
        )}
      </Button>
      {isEditing && onCancel && (
        <Button variant="outline" onClick={onCancel} type="button">
          Cancel
        </Button>
      )}
    </div>
  );
};
