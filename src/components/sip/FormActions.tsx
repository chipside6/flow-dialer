
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Server } from "lucide-react";

interface FormActionsProps {
  onSubmit: () => void;
  onCancel?: () => void;
  isEditing: boolean;
}

export const FormActions: React.FC<FormActionsProps> = ({
  onSubmit,
  onCancel,
  isEditing,
}) => {
  return (
    <div className="flex space-x-2">
      <Button onClick={onSubmit}>
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
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      )}
    </div>
  );
};
